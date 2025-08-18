# 🏥 Elyx Healthcare - AI-Powered Health Journey Visualization

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688)](https://fastapi.tiangolo.com/)
[![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-orange)](https://groq.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

An innovative health journey visualization system that tracks AI-driven health interventions and their real-world impact on patient outcomes. Built for the Elyx Healthcare Hackathon.

## 🏗️ **Technical Architecture**

### **Frontend** (Next.js 15 + TypeScript)
```
frontend/
├── src/
│   ├── components/
│   │   ├── Charts/           # Biomarker visualization
│   │   ├── Chat/             # Health conversation interface
│   │   ├── Modals/           # Decision drill-down analysis
│   │   ├── Timeline/         # 8-month journey view
│   │   └── providers/        # Theme and context providers
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API integration
│   └── app/                  # Next.js app router
```

### **Backend** (FastAPI + Python)
```
backend/
├── app/
│   ├── agents/               # AI health specialists
│   ├── api/routes/           # RESTful endpoints
│   ├── core/                 # Configuration
│   ├── db/                   # Database models
│   ├── models/               # Pydantic schemas
│   └── services/             # Business logic
```

### **Database** (Supabase PostgreSQL)
- **Members**: Patient profiles and health goals
- **Agents**: AI specialist configurations
- **Messages**: Complete conversation history
- **Health Events**: Diagnostic reports and milestones
- **Journey States**: Monthly biomarker snapshots

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.11+
- Supabase account
- Groq API key

### **1. Clone Repository**
```bash
git clone https://github.com/srijabal/Elyx_Healthcare.git
cd Elyx_Healthcare
```

### **2. Backend Setup**
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Add your API keys and database URL

# Setup database
# Run supabase_setup.sql in your Supabase dashboard

# Generate realistic journey data
python save_realistic_journey.py

# Start server
uvicorn app.main:app --reload
```

### **3. Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

### **4. Access Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🌐 **Live Demo**

- **🖥️ Frontend**: [https://elyx-healthcare.vercel.app](https://elyx-healthcare.vercel.app)
- **🔗 Backend API**: [https://elyxhealthcare-production.up.railway.app](https://elyxhealthcare-production.up.railway.app)
- **📚 API Documentation**: [https://elyxhealthcare-production.up.railway.app/docs](https://elyxhealthcare-production.up.railway.app/docs)

## 🎨 **Key Features in Detail**

### **Decision Traceability**
Our breakthrough feature shows:
1. **Decision Context**: Health status when AI made recommendation
2. **Intervention Details**: Specific advice given and rationale
3. **Expected Outcomes**: Predicted health improvements
4. **Actual Results**: Measured biomarker changes in subsequent months
5. **Impact Analysis**: Quantified success/failure of AI interventions

### **Health Journey Simulation**
- **Realistic Timeline**: 8 months with proper date distribution
- **Authentic Conversations**: AI-generated interactions with real medical context
- **Progressive Improvement**: Gradual health transformation with setbacks
- **Travel Disruptions**: Real-world challenges affecting adherence
- **Quarterly Checkups**: Comprehensive diagnostic reports

## 🔧 **API Endpoints**

### **Journey Management**
```
GET  /api/v1/journey/members/{id}           # Get complete member journey
GET  /api/v1/journey/members/{id}/timeline  # Get timeline data
POST /api/v1/journey/generate-realistic     # Generate new journey
```

### **Health Data**
```
GET  /api/v1/agents                         # List all AI agents
GET  /api/v1/messages                       # Get conversation history
GET  /api/v1/health                         # Health check endpoint
```

## 🛠️ **Technology Stack**

### **Frontend**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **State Management**: React Query

### **Backend**
- **Framework**: FastAPI
- **Language**: Python 3.11
- **AI Integration**: Groq LLaMA 3.3-70b
- **Database**: Supabase PostgreSQL
- **ORM**: SQLAlchemy
- **Validation**: Pydantic

### **Deployment**
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Supabase Cloud
- **AI**: Groq Cloud
