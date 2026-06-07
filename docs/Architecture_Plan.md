# Architecture Plan
**Product:** IdeaForge

## 1. Technology Stack
- **Frontend:** React (Modern UI, highly interactive, fast).
- **Backend:** Python (FastAPI or Flask) for high-performance API handling and logic execution.
- **AI Engine:** OpenAI API (LLM for text generation, reasoning, and data structuring).
- **Database:** PostgreSQL (Local development, deployed on Replit for production).
- **Hosting/Deployment:** Replit.

## 2. System Architecture Components
### 2.1 Frontend (React)
- **Role:** Handles user interaction, forms, and dynamic data visualization. Provides a structured input and output experience.
- **Key Modules:** 
  - `Input Wizard:` Step-by-step forms for Ideas, Constraints, Goals.
  - `Artifact Viewer:` Markdown and table-based viewer for PRDs, User Stories, and Task Lists.
  - `Admin Dashboard View:` Analytics, monitoring, and usage stats.

### 2.2 Backend (Python)
- **Role:** Orchestrates data flow, manages AI requests, and executes the Smart Logic Layer.
- **Key Modules:**
  - `API Gateway:` RESTful endpoints for the React frontend.
  - `AI Orchestrator:` Formats prompts, handles retry logic, and parses OpenAI API JSON responses.
  - `Smart Logic Engine:` Applies scoring rules, risk factors, and prioritization logic to the AI outputs.
  - `Data Access Layer (DAL):` Interacts with PostgreSQL using an ORM (e.g., SQLAlchemy or SQLModel).

### 2.3 Database (PostgreSQL)
- **Role:** Persistent storage of user data, projects, and generated workflows.
- **Core Tables:**
  - `Users` / `Workspaces`
  - `Projects` (Idea, Goals, Constraints)
  - `Artifacts` (PRDs, User Stories, Tasks, Sprint Plans)
  - `AdminLogs` (API usage, system events, errors)

## 3. System Integration: End-to-End Data Flow
1. **Input:** User submits product details via React Frontend.
2. **Request:** Frontend sends JSON payload to Python Backend via REST API.
3. **Processing (AI):** Backend constructs precise prompts and calls OpenAI API.
4. **Processing (Logic):** OpenAI response is parsed; Smart Logic Engine assigns priority scores, risk metrics, and enhances the raw data.
5. **Storage:** Final structured and scored data is saved to PostgreSQL via the DAL.
6. **Output:** Backend returns structured JSON to Frontend, which natively renders the execution plan.

## 4. Development & Deployment Phases
- **Phase 1 (Local Foundation):** Setup React frontend, Python backend, and local PostgreSQL instance. Establish OpenAI connection.
- **Phase 2 (Core Processing):** Implement the AI prompt chain and the Smart Logic Layer.
- **Phase 3 (Persistence & Admin):** Finalize database schema, save workflows, and build the Admin Dashboard.
- **Phase 4 (Deployment):** Migrate PostgreSQL and application code to Replit for live access and testing.
