from supabase import create_client, Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def get_supabase_client() -> Client:
    """Create and return Supabase client for real-time features and additional functionality"""
    try:
        if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
            logger.warning("Supabase credentials not configured, using PostgreSQL only")
            return None
            
        supabase: Client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_ANON_KEY
        )
        return supabase
    except Exception as e:
        logger.error(f"Failed to create Supabase client: {e}")
        return None

# Global Supabase client instance
supabase_client = get_supabase_client()