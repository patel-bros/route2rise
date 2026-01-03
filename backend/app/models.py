from enum import Enum
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

# Enums
class SectorEnum(str, Enum):
    HEALTHCARE = "Healthcare"
    REAL_ESTATE = "Real Estate"
    SAAS = "SaaS"
    EDUCATION = "Education"
    ECOMMERCE = "E-commerce"
    FINANCE = "Finance"
    MANUFACTURING = "Manufacturing"
    RETAIL = "Retail"
    HOSPITALITY = "Hospitality"
    TECHNOLOGY = "Technology"
    OTHER = "Other"

class LeadStatusEnum(str, Enum):
    NEW = "New"
    CONTACTED = "Contacted"
    INTERESTED = "Interested"
    NOT_INTERESTED = "Not Interested"
    FOLLOW_UP = "Follow-Up"
    CONVERTED = "Converted"
    LOST = "Lost"

class SourceEnum(str, Enum):
    GOOGLE_MAPS = "Google Maps"
    LINKEDIN = "LinkedIn"
    WEBSITE = "Website"
    REFERRAL = "Referral"
    COLD_EMAIL = "Cold Email"
    OTHER = "Other"

class FounderEnum(str, Enum):
    FOUNDER_A = "Founder A"
    FOUNDER_B = "Founder B"

# Pydantic Models

class InteractionLogItem(BaseModel):
    timestamp: datetime
    action: str  # e.g., "called", "replied", "emailed", "note_added"
    notes: Optional[str] = None

class InteractionHistoryResponse(BaseModel):
    timestamp: datetime
    action: str
    notes: Optional[str] = None

class LeadBase(BaseModel):
    company_name: str
    sector: SectorEnum
    website_url: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile_number: Optional[str] = None
    full_address: Optional[str] = None
    source: SourceEnum
    status: LeadStatusEnum = LeadStatusEnum.NEW
    last_contacted_date: Optional[datetime] = None
    latest_reply_notes: Optional[str] = None
    call_schedule_date: Optional[datetime] = None
    next_follow_up_date: Optional[datetime] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    company_name: Optional[str] = None
    sector: Optional[SectorEnum] = None
    website_url: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile_number: Optional[str] = None
    full_address: Optional[str] = None
    source: Optional[SourceEnum] = None
    status: Optional[LeadStatusEnum] = None
    last_contacted_date: Optional[datetime] = None
    latest_reply_notes: Optional[str] = None
    call_schedule_date: Optional[datetime] = None
    next_follow_up_date: Optional[datetime] = None

class LeadResponse(LeadBase):
    id: str = Field(alias="_id")
    created_by: str
    assigned_to: str
    created_at: datetime
    updated_at: datetime
    interaction_history: List[InteractionHistoryResponse] = []
    is_deleted: bool = False

    class Config:
        populate_by_name = True

class LeadDetailResponse(LeadResponse):
    pass

class DashboardStats(BaseModel):
    total_leads: int
    leads_by_status: dict
    leads_by_sector: dict
    leads_by_owner: dict
    upcoming_calls: List[LeadDetailResponse] = []
    recent_updates: List[LeadDetailResponse] = []

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    founder: str

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    founder_name: str
