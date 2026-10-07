# PrepCycle — Full-Stack Exam Preparation Platform

PrepCycle is a React + Node.js + MongoDB application for Indian examination preparation, learning-resource discovery, progress tracking, marketplace purchasing, delivery tracking and peer learning.

## Core capabilities
- Single login form with automatic routing by authenticated account role.
- Student, Mentor, Admin and Delivery Partner roles.
- Dedicated Mentor Portal (/mentor) for tracking assigned students, syllabus completion, and mock scores.
- Real-time WhatsApp, SMS, Email and In-App notification alerts sent to mentors whenever students take a mock test or complete a subject.
- Admin dashboard tab to create mentors and assign/reassign mentors to individual students.
- JWT authentication and password hashing.
- Google OAuth and Apple OAuth through provider authorization flows; provider credentials are configured in `backend/.env`.
- Student IDs generated automatically and searchable by administrators.
- Exam Explorer with registered/unregistered exams, official-source links, eligibility, application information and subject roadmaps.
- Subject-level study roadmaps with chapters ordered by High/Medium/Low weightage while retaining every chapter and topic.
- Topic progress, chapter performance, mock-test attempts and multi-level analytics.
- Built-in flashcards plus user-created and generated flashcards.
- Quiz generation from notes and topics.
- Resource library, marketplace, cart and checkout.
- Payment choices: Cash on Delivery, UPI, Google Pay, Credit/Debit Card and Net Banking.
- Automatic order tracking plus assigned Delivery Partner workflow.
- Returns, resale-to-PrepCycle and donation requests.
- Discussion board plus student-to-student direct messaging.
- Global AI chatbot with optional OpenAI integration, note/progress context and browser voice input/output.
- English, Tamil and Hindi interface options, light/dark theme support and font-size preference.
- Rate limiting, recently accessed items and personalized daily opening motivation.

## Start
1. Install Node.js and MongoDB (local or Atlas).
2. Copy `backend/.env.example` to `backend/.env` and configure MongoDB/JWT. Add OAuth provider values when using Google or Apple sign-in.
3. From the project root run:

```powershell
npm run setup
npm run dev
```

4. Open `http://localhost:5173`.

## Seeded accounts
The backend creates five student accounts and one delivery account when the database is empty for those accounts. The admin account is controlled by `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` in the environment.

Student accounts:
- student1@prepcycle.test through student5@prepcycle.test
- Password: `Student@12345`

Delivery account:
- delivery@prepcycle.com
- Password: `Delivery@12345`

Change seeded credentials before any real deployment.

## AI chatbot
Set `OPENAI_API_KEY` in `backend/.env` to enable AI responses. The backend sends relevant student progress and recent notes as context. `OPENAI_MODEL` can be set to a supported chat model.

## Exam data
Exam records are sourced from official examination-authority portals. Time-sensitive dates should be re-verified against the linked authority notification before a student relies on them. PrepCycle does not invent application deadlines or examination dates when an authority has not published them.

### Windows one-click start

After Node.js and MongoDB are installed, run `START_WINDOWS.bat` from the project folder. On first run it installs the three dependency sets and then starts the backend and Vite frontend together. `VERIFY_WINDOWS.bat` performs backend syntax and project-source checks.

The included `backend/.env` uses a local MongoDB database and a development JWT secret so the project can start without exposing deployment credentials. For MongoDB Atlas or deployment, replace those environment values with your own secure settings.
