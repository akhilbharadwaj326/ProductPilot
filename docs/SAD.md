# System Architecture Document (SAD)
**Product:** IdeaForge

## 1. Overview & Technology Stack
- **Frontend:** React (Modern UI, highly interactive, fast).
- **Backend:** Python (FastAPI or Flask) for high-performance API handling and logic execution.
- **AI Engine:** OpenAI API (LLM for text generation, reasoning, and data structuring).
- **Database:** PostgreSQL (Local development, deployed on Replit for production).
- **Hosting/Deployment:** Replit.

## 2. System Architecture Components
### 2.1 Frontend (React)
- **Role:** Handles user interaction, forms, and dynamic data visualization. Provides a premium, Notion/Linear-like workspace.

### 2.2 Backend (Python)
- **Role:** Orchestrates data flow, manages AI requests, and executes the Smart Logic Layer.
- **Key Modules:**
  - `API Gateway:` RESTful endpoints.
  - `AI Orchestrator:` Formats prompts and parses OpenAI API JSON responses.
  - `Smart Logic Engine:` Applies scoring rules, risk factors, and prioritization logic.
  - `Data Access Layer (DAL):` Interacts with PostgreSQL using an ORM.

### 2.3 Database (PostgreSQL)
- **Role:** Persistent storage of user data, projects, and generated workflows.
- **Core Tables:** `Users`, `Workspaces`, `Projects`, `Artifacts`, `AuditLogs`.

## 3. Cross-Cutting Concerns

### 3.1 Logging & Monitoring
- **Centralized Logging:** Implement structured JSON logging on the backend to capture system events.
- **Audit Trails:** All AI generations, user edits to cards, and status changes are logged in the `AuditLogs` table with timestamps and user IDs.
- **Monitoring:** Track API response times, OpenAI token usage, and system error rates. Visualized in the Admin Dashboard.

### 3.2 Error Handling & Resilience
- **Global Exception Handling:** The backend will catch unhandled exceptions and return standardized HTTP error responses to the frontend.
- **Retry Mechanisms:** Exponential backoff for OpenAI API calls to elegantly handle rate limits (429) or transient errors (500, 502).
- **Graceful Degradation:** If the Smart Logic Layer fails, the system provides a fallback estimation so the workflow is not entirely blocked.

### 3.3 Security Norms
- **Authentication:** Secure JWT-based authentication for user sessions.
- **Authorization:** Role-Based Access Control (RBAC) to restrict access to the Admin Dashboard.
- **Data Protection:** Encryption at rest for the database; data in transit secured via TLS/HTTPS.
- **Input Validation:** Strict payload validation using schemas (e.g., Pydantic) to prevent injection attacks and ensure data integrity.
- **Secrets Management:** API keys and database credentials securely stored in environment variables, never hardcoded.

## 4. End-to-End Data Flow
1. **Input:** User submits product details via React Frontend.
2. **Request:** Frontend sends JSON payload to Python Backend via HTTPS.
3. **Processing (AI):** Backend securely calls OpenAI API (with retry logic).
4. **Processing (Logic):** AI response is validated and parsed; Smart Logic Engine assigns priority scores.
5. **Storage:** Structured data is saved to PostgreSQL via the DAL, logging the event.
6. **Output:** Backend returns structured JSON to Frontend, which renders the execution plan.
