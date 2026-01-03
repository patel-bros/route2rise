from fastapi import APIRouter, HTTPException, status, Depends, Query
from app.models import (
    LeadCreate, LeadUpdate, LeadResponse, LeadDetailResponse, 
    DashboardStats, InteractionHistoryResponse
)
from app.auth.jwt_handler import verify_token
from app.leads.service import LeadService
from typing import List

router = APIRouter(prefix="/leads", tags=["leads"])

@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    assigned_to: str = Query(None),
    user: dict = Depends(verify_token)
):
    """Get dashboard statistics"""
    stats = await LeadService.get_dashboard_stats(assigned_to)
    
    return stats

@router.post("", response_model=LeadResponse)
async def create_lead(
    lead: LeadCreate,
    user: dict = Depends(verify_token)
):
    """Create a new lead"""
    created_lead = await LeadService.create_lead(
        lead=lead,
        created_by=user["founder"],
        assigned_to=user["founder"]
    )
    
    return created_lead

@router.get("", response_model=dict)
async def list_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: str = Query(None),
    sector: str = Query(None),
    assigned_to: str = Query(None),
    search: str = Query(None),
    user: dict = Depends(verify_token)
):
    """List leads with pagination and filters"""
    leads, total = await LeadService.list_leads(
        skip=skip,
        limit=limit,
        status=status,
        sector=sector,
        assigned_to=assigned_to,
        search=search
    )
    
    return {
        "leads": leads,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{lead_id}", response_model=LeadDetailResponse)
async def get_lead(
    lead_id: str,
    user: dict = Depends(verify_token)
):
    """Get lead by ID"""
    lead = await LeadService.get_lead(lead_id)
    
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    return lead

@router.put("/{lead_id}", response_model=LeadDetailResponse)
async def update_lead(
    lead_id: str,
    lead_update: LeadUpdate,
    user: dict = Depends(verify_token)
):
    """Update a lead"""
    updated_lead = await LeadService.update_lead(lead_id, lead_update)
    
    if not updated_lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    return updated_lead

@router.post("/{lead_id}/interaction")
async def add_interaction(
    lead_id: str,
    action: str = Query(...),
    notes: str = Query(None),
    user: dict = Depends(verify_token)
):
    """Add interaction to lead"""
    updated_lead = await LeadService.add_interaction(lead_id, action, notes)
    
    if not updated_lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    return updated_lead

@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: str,
    user: dict = Depends(verify_token)
):
    """Soft delete a lead"""
    deleted_lead = await LeadService.soft_delete_lead(lead_id)
    
    if not deleted_lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    return {"message": "Lead deleted successfully"}
