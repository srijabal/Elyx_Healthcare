# Elyx Health Journey Backend

AI-powered health journey simulation system built for the Elyx hackathon.

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables** (create `.env` file):
   ```
   GROQ_API_KEY=your_groq_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_postgresql_connection_string
   ```

3. **Set up database**:
   ```bash
   # Run the SQL script in your Supabase dashboard
   # File: supabase_setup.sql
   ```

4. **Start the server**:
   ```bash
   uvicorn app.main:app --reload
   ```

## 🎯 Demo Scripts

### Generate & Save Realistic Journey
```bash
python save_realistic_journey.py
```
- Generates complete 8-month health journey (182 messages)
- Saves to Supabase database
- Perfect for judge demonstrations

### Enhanced Journey Generation
```bash
python scripts/generate_realistic_journey.py
```
- Comprehensive journey with all constraints
- Includes travel disruptions, plan adjustments
- 50% adherence rate (realistic)

## 📊 Journey Features

- **182 Messages**: 160 member questions + 22 agent responses
- **8-Month Timeline**: Complete health transformation
- **6 Specialized Agents**: Medical, nutrition, fitness, mental health
- **Realistic Constraints**: Travel, work stress, plan adherence
- **Health Transformation**: Pre-hypertension → normalized BP

## 🏗 Architecture

```
app/
├── agents/          # AI agents (Dr. Warren, Ruby, etc.)
├── api/routes/      # FastAPI endpoints
├── core/            # Configuration
├── db/              # Database models & connection
├── models/          # Pydantic schemas
└── services/        # Business logic
```

## 🔗 API Endpoints

- `GET /api/v1/journey/members/{id}` - Get member profile
- `GET /api/v1/journey/members/{id}/timeline` - Get journey timeline
- `POST /api/v1/journey/generate-realistic` - Generate new journey

## 🎨 Frontend Integration

Backend is ready for React frontend connection. All APIs return JSON with:
- Member profiles
- Message timelines
- Health transformations
- Biomarker progressions

---

**Built for Elyx Hackathon** | **Team**: [Your Team Name]