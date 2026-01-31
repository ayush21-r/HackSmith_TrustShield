# TrustShield Application Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TRUSTSHIELD PLATFORM                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐                        ┌──────────────────────────┐
│   FRONTEND (PORT 3000)│                        │  BACKEND (PORT 5000)     │
│   React + Vite       │◄──────HTTP/CORS────────►  Express.js + Prisma     │
│   Tailwind CSS       │                        │  SQLite Database         │
└──────────────────────┘                        └──────────────────────────┘
         │                                              │
         │                                              │
    Pages & Components                          Routes & Controllers
    ├─ Login                                    ├─ /api/auth/login
    ├─ Home                                     ├─ /api/auth/me
    ├─ Report Complaint                         ├─ /api/complaints
    ├─ Check Status                             ├─ /api/complaints/:id
    ├─ HR Dashboard                             └─ /api/complaints/:id/*
    └─ View Complaint (HR)
```

## Data Flow

```
USER SUBMITS COMPLAINT
    │
    ▼
POST /api/complaints
    │
    ▼
complaintController.submitComplaint()
    │
    ├─ Validate data
    ├─ Generate AI confidence score
    ├─ Create Complaint record
    └─ Create initial RECEIVED workflow step
    │
    ▼
SQLite Database
    │
    ├─ complaints table
    ├─ workflow_steps table
    └─ users table
    │
    ▼
Return complaint with ID
    │
    ▼
Frontend shows confirmation
```

## User Flows

### Employee Flow

```
┌──────────┐
│  Open   │
│ Browser │
└────┬────┘
     │
     ▼
┌──────────────┐
│ Login Page   │
│ Enter Creds  │
└────┬────────┘
     │
     ▼
┌──────────────┐
│ Home Page    │
│ 2 Options    │
└────┬────────┘
     │
     ├─────────────────┬──────────────────┐
     │                 │                  │
     ▼                 ▼                  ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│   Report    │  │ Check Status │  │   Logout     │
│  Complaint  │  │              │  │              │
└────┬────────┘  └──────┬───────┘  └──────────────┘
     │                  │
     ▼                  ▼
┌─────────────┐  ┌──────────────┐
│ Fill Form   │  │ Enter ID     │
│ Anonymous?  │  │              │
│ Submit      │  │ View Status  │
└────┬────────┘  └──────┬───────┘
     │                  │
     ▼                  ▼
┌─────────────┐  ┌──────────────┐
│ Get ID      │  │ Show Workflow│
│ Show Status │  │ + AI Score   │
└─────────────┘  │ + HR Notes   │
                 └──────────────┘
```

### HR Flow

```
┌──────────┐
│  Open   │
│ Browser │
└────┬────┘
     │
     ▼
┌──────────────┐
│ Login Page   │
│ HR Creds     │
└────┬────────┘
     │
     ▼
┌──────────────────┐
│ HR Dashboard     │
│ View All Cases   │
└────┬─────────────┘
     │
     ├─────────────────────┬──────────────────┐
     │                     │                  │
     ▼                     ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Filter by    │  │ View Details │  │   Logout     │
│ Status       │  │ on Complaint │  │              │
└──────────────┘  └────┬────────┘  └──────────────┘
                       │
                       ▼
                  ┌──────────────────┐
                  │ View Complaint   │
                  │ Full Details     │
                  └────┬─────────────┘
                       │
                       ├────────┬─────────────┐
                       │        │             │
                       ▼        ▼             ▼
                   ┌──────┐ ┌─────────┐ ┌──────────────┐
                   │ Add  │ │ Move to │ │ View Evidence│
                   │Notes │ │ Next    │ │ Files        │
                   │      │ │ Step    │ │              │
                   └──────┘ └─────────┘ └──────────────┘
```

## Database Schema

```
┌──────────────────────────────────────────────────────────────────┐
│                         DATABASE                                │
│                       (SQLite)                                  │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌──────────────────┐     ┌───────────────┐
│      Users      │     │   Complaints     │     │     Files     │
├─────────────────┤     ├──────────────────┤     ├───────────────┤
│ id (PK)         │     │ id (PK)          │     │ id (PK)       │
│ email (Unique)  │     │ title            │     │ filename      │
│ password        │     │ description      │     │ filepath      │
│ name            │     │ isAnonymous      │     │ mimeType      │
│ role (ENUM)     │     │ status (ENUM)    │     │ complaintId   │
│ createdAt       │     │ confidenceScore  │     │ uploadedAt    │
│ updatedAt       │     │ currentStep      │     └───────────────┘
└────────┬────────┘     │ reportedById (FK)│
         │              │ createdAt        │
         │              │ updatedAt        │
         │              └────────┬─────────┘
         │                       │
         ├───────────────────────┤
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│     Comments    │     │  WorkflowSteps   │
├─────────────────┤     ├──────────────────┤
│ id (PK)         │     │ id (PK)          │
│ content         │     │ complaintId (FK) │
│ authorId (FK)   │     │ step (ENUM)      │
│ complaintId(FK) │     │ notes            │
│ createdAt       │     │ completedAt      │
└─────────────────┘     └──────────────────┘

Legend:
PK = Primary Key
FK = Foreign Key
ENUM = Status/Role field
```

## Workflow Progression

```
Step 1           Step 2          Step 3           Step 4         Step 5
RECEIVED ────→ REVIEW ────→ INVESTIGATION ────→ ACTION ────→ CLOSED
  │               │              │                │             │
  ├─ Logged in   ├─ Manager    ├─ Interviews   ├─ Decision   ├─ Case
  ├─ ID created │   review    │   conducted   │   made       │  closed
  └─ Stored      └─ Initial    └─ Evidence    └─ Actions    └─ Documented
                   verdict       gathered       taken

Only linear progression allowed - no skipping steps!
HR must explicitly move to next step.
Comments logged at each stage.
```

## Authentication Flow

```
┌────────────────────────────────────────────────────────────┐
│                   AUTH FLOW                                │
└────────────────────────────────────────────────────────────┘

STEP 1: LOGIN
User enters email + password
         │
         ▼
POST /api/auth/login
         │
         ▼
Check against hardcoded demo users
         │
         ├─ Valid    ────────────┐
         │                       │
         └─ Invalid ───────┐     │
                           │     │
                           ▼     ▼
                        Error   JWT Token
                                Generated
                                   │
                                   ▼
                        Return token + user info
                                   │
                                   ▼
                        STEP 2: STORE TOKEN
                        localStorage.setItem('token')
                                   │
                                   ▼
                        STEP 3: USE TOKEN
                        All subsequent requests:
                        Headers: Authorization: Bearer {token}
                                   │
                                   ▼
                        Middleware verifies token
                                   │
                        ┌──────────┴──────────┐
                        │                     │
                        ▼                     ▼
                     Valid              Invalid/Expired
                     │                     │
                     ▼                     ▼
                 Continue              Redirect to login
                 Request               or show error
```

## Component Hierarchy

```
App
├── Router
    ├── /login
    │   └── Login
    │
    ├── Protected Routes (Employee)
    │   ├── /
    │   │   └── Home
    │   │       ├── ReportButton
    │   │       ├── CheckStatusForm
    │   │       └── InfoCards
    │   │
    │   ├── /report
    │   │   └── ReportComplaint
    │   │       ├── Form (title, description)
    │   │       ├── AnonymousCheckbox
    │   │       └── SubmitButton
    │   │
    │   └── /complaint/:id
    │       └── ComplaintStatus
    │           ├── WorkflowVisualization
    │           ├── DetailsCard
    │           ├── AIScoreCard
    │           ├── CommentsSection
    │           └── FilesSection
    │
    └── Protected Routes (HR Only)
        ├── /hr-dashboard
        │   └── HRDashboard
        │       ├── StatisticsCards
        │       ├── StatusFilter
        │       └── ComplaintsList
        │
        └── /view-complaint/:id
            └── ViewComplaint
                ├── ComplaintDetails (left)
                │   ├── Title + ID
                │   ├── Description
                │   ├── FilesSection
                │   └── CommentsSection
                │
                └── SideBar (right)
                    ├── StatusCard
                    ├── WorkflowVisualization
                    ├── ProgressButton
                    └── AIScoreCard
```

## Request/Response Cycle

```
EXAMPLE: Submit Complaint

CLIENT (Browser)
    │
    │ 1. User fills form
    │    title = "Harassment"
    │    description = "Inappropriate behavior"
    │    isAnonymous = true
    │
    ▼
┌─────────────────────────────────────────┐
│ 2. Axios POST request                   │
│    POST /api/complaints                 │
│    Headers: Authorization: Bearer token │
│    Body: {title, description, anonymous}
└──────────┬──────────────────────────────┘
           │
           ▼
SERVER (Backend)
    │
    │ 3. Express receives request
    │    Routes to /api/complaints
    │
    ▼
    │ 4. Controller processes
    │    - Validates data
    │    - Generates AI score (random 0-1)
    │    - Creates complaint in DB
    │    - Creates RECEIVED workflow step
    │
    ▼
SQLite Database
    │ 5. Data stored
    │    - Complaint record created
    │    - Workflow step added
    │
    ▼
    │ 6. Response generated
    │    {
    │      id: 1,
    │      title: "Harassment",
    │      status: "RECEIVED",
    │      confidenceScore: 0.73,
    │      ...
    │    }
    │
    ▼
┌─────────────────────────────────────────┐
│ 7. Response sent to client              │
│    Status: 201 Created                  │
│    Body: complaint object               │
└──────────┬──────────────────────────────┘
           │
           ▼
CLIENT (Browser)
    │
    │ 8. JavaScript handles response
    │    - Display success message
    │    - Show complaint ID
    │    - Redirect to status page
    │
    ▼
DONE ✓
```

## Security Layers

```
┌──────────────────────────────────────────────────────────────┐
│               SECURITY ARCHITECTURE                          │
└──────────────────────────────────────────────────────────────┘

LAYER 1: AUTHENTICATION
    ├─ JWT tokens
    ├─ 24-hour expiry
    ├─ Hardcoded demo users (hackathon)
    └─ Token stored in localStorage

LAYER 2: AUTHORIZATION
    ├─ Role checking (EMPLOYEE vs HR)
    ├─ Protected routes
    ├─ Endpoint middleware verification
    └─ HR-only operations blocked for employees

LAYER 3: ANONYMITY PROTECTION
    ├─ isAnonymous flag on complaints
    ├─ Don't return reporter info when anonymous
    ├─ Backend still tracks user ID
    └─ Frontend hides identity

LAYER 4: DATA VALIDATION
    ├─ Input validation
    ├─ Type checking
    ├─ Required field verification
    └─ Prisma schema constraints

LAYER 5: DATABASE
    ├─ Foreign key constraints
    ├─ Cascading deletes
    ├─ Proper relationships
    └─ Indexed queries
```

---

This architecture ensures TrustShield is:
- ✅ Secure (JWT auth, role-based)
- ✅ Scalable (proper separation of concerns)
- ✅ Maintainable (clean code, good comments)
- ✅ Performant (indexed database queries)
- ✅ Demo-Ready (works out of the box)
