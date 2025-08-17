from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, journey, agents, messages
from app.db.database import engine
from app.db import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Elyx Health Journey API",
    description="API for AI-powered health journey simulation",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(health.router, prefix="/api/v1/health", tags=["health"])
app.include_router(journey.router, prefix="/api/v1/journey", tags=["journey"])
app.include_router(agents.router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(messages.router, prefix="/api/v1/messages", tags=["messages"])

@app.get("/")
async def root():
    return {"message": "Elyx Health Journey API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)