from bson import ObjectId
from datetime import datetime
from typing import List, Optional
from app.database.mongo import get_db
from app.models import (
    LeadCreate, LeadUpdate, LeadResponse, LeadStatusEnum, 
    InteractionHistoryResponse, DashboardStats
)
import logging

logger = logging.getLogger(__name__)

class LeadService:
    
    @staticmethod
    async def create_lead(lead: LeadCreate, created_by: str, assigned_to: str) -> dict:
        """Create a new lead"""
        db = get_db()
        
        lead_dict = lead.dict()
        lead_dict["created_by"] = created_by
        lead_dict["assigned_to"] = assigned_to
        lead_dict["created_at"] = datetime.utcnow()
        lead_dict["updated_at"] = datetime.utcnow()
        lead_dict["interaction_history"] = []
        lead_dict["is_deleted"] = False
        
        result = await db.leads.insert_one(lead_dict)
        lead_dict["_id"] = str(result.inserted_id)
        
        return lead_dict
    
    @staticmethod
    async def get_lead(lead_id: str, include_deleted: bool = False) -> Optional[dict]:
        """Get a single lead"""
        db = get_db()
        
        try:
            lead = await db.leads.find_one({
                "_id": ObjectId(lead_id),
                "is_deleted": False if not include_deleted else {"$in": [True, False]}
            })
            
            if lead:
                lead["_id"] = str(lead["_id"])
            
            return lead
        except Exception as e:
            logger.error(f"Error fetching lead {lead_id}: {str(e)}")
            return None
    
    @staticmethod
    async def list_leads(
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
        sector: Optional[str] = None,
        assigned_to: Optional[str] = None,
        search: Optional[str] = None
    ) -> tuple[List[dict], int]:
        """List leads with filters"""
        db = get_db()
        
        query = {"is_deleted": False}
        
        if status:
            query["status"] = status
        if sector:
            query["sector"] = sector
        if assigned_to:
            query["assigned_to"] = assigned_to
        
        if search:
            query["$or"] = [
                {"company_name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
                {"mobile_number": {"$regex": search, "$options": "i"}}
            ]
        
        total = await db.leads.count_documents(query)
        
        leads = await db.leads.find(query)\
            .sort("created_at", -1)\
            .skip(skip)\
            .limit(limit)\
            .to_list(length=limit)
        
        for lead in leads:
            lead["_id"] = str(lead["_id"])
        
        return leads, total
    
    @staticmethod
    async def update_lead(lead_id: str, lead_update: LeadUpdate) -> Optional[dict]:
        """Update a lead"""
        db = get_db()
        
        try:
            update_data = lead_update.dict(exclude_unset=True)
            update_data["updated_at"] = datetime.utcnow()
            
            result = await db.leads.find_one_and_update(
                {"_id": ObjectId(lead_id), "is_deleted": False},
                {"$set": update_data},
                return_document=True
            )
            
            if result:
                result["_id"] = str(result["_id"])
            
            return result
        except Exception as e:
            logger.error(f"Error updating lead {lead_id}: {str(e)}")
            return None
    
    @staticmethod
    async def add_interaction(lead_id: str, action: str, notes: Optional[str] = None) -> Optional[dict]:
        """Add interaction to lead history"""
        db = get_db()
        
        try:
            interaction = {
                "timestamp": datetime.utcnow(),
                "action": action,
                "notes": notes
            }
            
            result = await db.leads.find_one_and_update(
                {"_id": ObjectId(lead_id), "is_deleted": False},
                {
                    "$push": {"interaction_history": interaction},
                    "$set": {"updated_at": datetime.utcnow()}
                },
                return_document=True
            )
            
            if result:
                result["_id"] = str(result["_id"])
            
            return result
        except Exception as e:
            logger.error(f"Error adding interaction to lead {lead_id}: {str(e)}")
            return None
    
    @staticmethod
    async def soft_delete_lead(lead_id: str) -> Optional[dict]:
        """Soft delete a lead"""
        db = get_db()
        
        try:
            result = await db.leads.find_one_and_update(
                {"_id": ObjectId(lead_id)},
                {
                    "$set": {
                        "is_deleted": True,
                        "updated_at": datetime.utcnow()
                    }
                },
                return_document=True
            )
            
            if result:
                result["_id"] = str(result["_id"])
            
            return result
        except Exception as e:
            logger.error(f"Error deleting lead {lead_id}: {str(e)}")
            return None
    
    @staticmethod
    async def get_dashboard_stats(assigned_to: Optional[str] = None) -> DashboardStats:
        """Get dashboard statistics"""
        db = get_db()
        
        query = {"is_deleted": False}
        if assigned_to:
            query["assigned_to"] = assigned_to
        
        # Total leads
        total_leads = await db.leads.count_documents(query)
        
        # Group by status
        status_pipeline = [
            {"$match": query},
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        status_groups = await db.leads.aggregate(status_pipeline).to_list(None)
        leads_by_status = {item["_id"]: item["count"] for item in status_groups}
        
        # Group by sector
        sector_pipeline = [
            {"$match": query},
            {"$group": {"_id": "$sector", "count": {"$sum": 1}}}
        ]
        sector_groups = await db.leads.aggregate(sector_pipeline).to_list(None)
        leads_by_sector = {item["_id"]: item["count"] for item in sector_groups}
        
        # Group by owner
        owner_pipeline = [
            {"$match": query},
            {"$group": {"_id": "$assigned_to", "count": {"$sum": 1}}}
        ]
        owner_groups = await db.leads.aggregate(owner_pipeline).to_list(None)
        leads_by_owner = {item["_id"]: item["count"] for item in owner_groups}
        
        # Upcoming calls
        upcoming_calls = await db.leads.find({
            **query,
            "call_schedule_date": {"$exists": True, "$ne": None, "$gte": datetime.utcnow()}
        }).sort("call_schedule_date", 1).limit(5).to_list(5)
        
        for call in upcoming_calls:
            call["_id"] = str(call["_id"])
        
        # Recently updated leads
        recent_updates = await db.leads.find(query)\
            .sort("updated_at", -1)\
            .limit(10)\
            .to_list(10)
        
        for update in recent_updates:
            update["_id"] = str(update["_id"])
        
        return DashboardStats(
            total_leads=total_leads,
            leads_by_status=leads_by_status,
            leads_by_sector=leads_by_sector,
            leads_by_owner=leads_by_owner,
            upcoming_calls=upcoming_calls,
            recent_updates=recent_updates
        )
