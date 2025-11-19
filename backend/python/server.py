from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MessageCreate(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    response: str
    session_id: str

class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    shoot_type: Optional[str] = None
    preferred_date: Optional[str] = None
    source: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LeadCreate(BaseModel):
    session_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    shoot_type: Optional[str] = None
    preferred_date: Optional[str] = None
    source: Optional[str] = None

class PortfolioItem(BaseModel):
    title: str
    description: str
    category: str

class Package(BaseModel):
    name: str
    description: str
    price: str
    features: List[str]

# Portfolio data
portfolio_data = [
    {
        "title": "Wedding Collections",
        "description": "Capturing timeless moments of your special day with artistic elegance and authentic emotion.",
        "category": "wedding"
    },
    {
        "title": "Portrait Sessions",
        "description": "Professional portraits that reveal personality and character through masterful lighting and composition.",
        "category": "portrait"
    },
    {
        "title": "Event Photography",
        "description": "Dynamic coverage of corporate events, celebrations, and special occasions.",
        "category": "event"
    },
    {
        "title": "Family Moments",
        "description": "Warm, natural family portraits that capture genuine connections and joy.",
        "category": "family"
    }
]

# Package data
package_data = [
    {
        "name": "Essential Package",
        "description": "Perfect for intimate sessions and smaller events",
        "price": "$599",
        "features": [
            "2 hours of shooting",
            "50 edited high-resolution images",
            "Online gallery for viewing and sharing",
            "Personal use printing rights"
        ]
    },
    {
        "name": "Premium Package",
        "description": "Our most popular choice for weddings and major events",
        "price": "$1,299",
        "features": [
            "6 hours of shooting",
            "200 edited high-resolution images",
            "Second photographer included",
            "Online gallery with download access",
            "Complimentary engagement session",
            "Full commercial printing rights"
        ]
    },
    {
        "name": "Signature Package",
        "description": "Complete coverage with luxury presentation",
        "price": "$2,499",
        "features": [
            "Full day coverage (up to 10 hours)",
            "400+ edited high-resolution images",
            "Two photographers and assistant",
            "Premium online gallery",
            "Engagement session included",
            "Custom-designed photo album",
            "Full commercial printing rights",
            "Complimentary prints package"
        ]
    }
]

# System message for the chatbot
SYSTEM_MESSAGE = """You are a friendly and professional virtual assistant for an elegant photography studio. Your role is to:

1. Warmly welcome visitors and engage them in conversation about their photography needs
2. Share information about the studio's services including weddings, portraits, events, and family photography
3. Describe the studio's artistic style: timeless, elegant, authentic, with masterful use of natural light and composition
4. Answer questions about packages and pricing when asked
5. When you detect booking interest, guide the conversation to collect:
   - Preferred shoot type (wedding, portrait, event, family, other)
   - Preferred date or timeframe
   - Name and contact information (phone or email)
   - Optionally: How they found the studio
6. Keep responses conversational, warm, and concise (2-3 sentences typically)
7. After collecting lead information, thank them and assure them the studio will reach out within 24 hours

Be helpful, professional, and genuinely interested in their photography needs."""

# Routes
@api_router.get("/")
async def root():
    return {"message": "Photography Studio API"}

@api_router.post("/chat", response_model=ChatResponse)
async def chat(input: MessageCreate):
    try:
        # Save user message
        user_msg = Message(
            session_id=input.session_id,
            role="user",
            content=input.message
        )
        user_doc = user_msg.model_dump()
        user_doc['timestamp'] = user_doc['timestamp'].isoformat()
        await db.messages.insert_one(user_doc)
        
        # Initialize LLM chat
        chat = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=input.session_id,
            system_message=SYSTEM_MESSAGE
        ).with_model("openai", "gpt-5")
        
        # Get chat history for context
        history = await db.messages.find(
            {"session_id": input.session_id},
            {"_id": 0}
        ).sort("timestamp", 1).to_list(100)
        
        # Send message and get response
        user_message = UserMessage(text=input.message)
        response_text = await chat.send_message(user_message)
        
        # Save assistant response
        assistant_msg = Message(
            session_id=input.session_id,
            role="assistant",
            content=response_text
        )
        assistant_doc = assistant_msg.model_dump()
        assistant_doc['timestamp'] = assistant_doc['timestamp'].isoformat()
        await db.messages.insert_one(assistant_doc)
        
        return ChatResponse(
            response=response_text,
            session_id=input.session_id
        )
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/leads", response_model=Lead)
async def create_lead(input: LeadCreate):
    try:
        lead = Lead(**input.model_dump())
        lead_doc = lead.model_dump()
        lead_doc['timestamp'] = lead_doc['timestamp'].isoformat()
        await db.leads.insert_one(lead_doc)
        return lead
    except Exception as e:
        logging.error(f"Lead creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/portfolio", response_model=List[PortfolioItem])
async def get_portfolio():
    return portfolio_data

@api_router.get("/packages", response_model=List[Package])
async def get_packages():
    return package_data

@api_router.get("/messages/{session_id}", response_model=List[Message])
async def get_messages(session_id: str):
    messages = await db.messages.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(1000)
    
    for msg in messages:
        if isinstance(msg['timestamp'], str):
            msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
    
    return messages

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()