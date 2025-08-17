from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Elyx Health Journey API is running"}


@router.get("/status")
async def api_status():
    """Detailed API status"""
    return {
        "status": "operational",
        "version": "1.0.0",
        "service": "Elyx Health Journey API",
        "features": [
            "Multi-agent health journey simulation",
            "LangGraph orchestration",
            "8-month journey generation",
            "WhatsApp-style messaging",
            "Biomarker progression tracking",
            "Journey visualization support"
        ]
    }