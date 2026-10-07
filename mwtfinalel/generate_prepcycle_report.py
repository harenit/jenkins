import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_report():
    doc = Document()

    # Set page margins (0.75 in)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        
        # Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run("23CS53C-Devops and Agile Methodologies")
        hrun.font.name = "Times New Roman"
        hrun.font.size = Pt(10)
        hrun.font.bold = True

        # Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        frun = fp.add_run("[Register No / Roll No : Name]")
        frun.font.name = "Times New Roman"
        frun.font.size = Pt(10)
        frun.font.bold = True

    # Helper styling function
    def add_title_box(table):
        for row in table.rows:
            for cell in row.cells:
                tcPr = cell._element.get_or_add_tcPr()
                tcBorders = parse_xml(r'''
                    <w:tcBorders {} >
                        <w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/>
                        <w:left w:val="single" w:sz="8" w:space="0" w:color="000000"/>
                        <w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/>
                        <w:right w:val="single" w:sz="8" w:space="0" w:color="000000"/>
                    </w:tcBorders>'''.format(nsdecls('w')))
                tcPr.append(tcBorders)

    # Top Table: Ex No & Title
    table = doc.add_table(rows=2, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    # Widths
    table.columns[0].width = Inches(2.0)
    table.columns[1].width = Inches(5.0)

    cell_00 = table.cell(0, 0)
    p00 = cell_00.paragraphs[0]
    r = p00.add_run("Ex no: 10")
    r.font.name = "Times New Roman"
    r.font.bold = True
    r.font.size = Pt(11)

    cell_10 = table.cell(1, 0)
    p10 = cell_10.paragraphs[0]
    r = p10.add_run("Date: ")
    r.font.name = "Times New Roman"
    r.font.bold = True
    r.font.size = Pt(11)

    cell_title = table.cell(0, 1)
    cell_title.merge(table.cell(1, 1))
    pt = cell_title.paragraphs[0]
    pt.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = pt.add_run("Building, Running and publishing a MERN Stack Application (PrepCycle) in Docker Hub")
    r.font.name = "Times New Roman"
    r.font.bold = True
    r.font.size = Pt(12)

    add_title_box(table)

    doc.add_paragraph() # Spacer

    def add_heading(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)
        run = p.add_run(text)
        run.font.name = "Times New Roman"
        run.font.bold = True
        run.font.size = Pt(12)
        return p

    def add_body(text, bold_prefix=None, space_after=3):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            run_bp = p.add_run(bold_prefix)
            run_bp.font.name = "Times New Roman"
            run_bp.font.bold = True
            run_bp.font.size = Pt(11)
        run = p.add_run(text)
        run.font.name = "Times New Roman"
        run.font.size = Pt(11)
        return p

    def add_code_block(code_text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.left_indent = Inches(0.2)
        run = p.add_run(code_text)
        run.font.name = "Consolas"
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(30, 30, 30)

    # Aim
    add_heading("Aim:")
    add_body("To containerize and deploy the PrepCycle full-stack MERN application (React + Vite frontend, Node.js + Express backend, and MongoDB database) using Docker. The objective is to build multi-stage Docker images for both frontend and backend, run the containerized services locally, and publish the production-ready images to Docker Hub for seamless, portable deployment across any cloud or local environment. Additionally, the complete project source code and Docker configuration will be version-controlled and hosted on GitHub.")

    # Requirements
    add_heading("Requirements:")
    add_body("1. PrepCycle MERN Stack Application (React Vite Frontend + Node.js Express Backend + MongoDB).\n"
             "2. Docker & Docker Engine installed on the system (Docker Desktop for Windows).\n"
             "3. Docker Hub account for repository hosting and image publishing.\n"
             "4. Git and GitHub account for source code version control and remote repository management.")

    # Procedure
    add_heading("Procedure:")
    add_body("Step 1: Project Setup", bold_prefix="")
    add_body("1. Organize the PrepCycle workspace into decoupled frontend and backend services:\n"
             "   • /frontend → React 18 application with Vite\n"
             "   • /backend → Node.js Express API server with MongoDB/Mongoose\n"
             "2. Verify both tiers run locally:\n"
             "   • Frontend: npm run dev (accessible on http://localhost:5173)\n"
             "   • Backend: node server.js or npm start (accessible on http://localhost:5000)")

    add_body("Step 2: Create Dockerfiles")
    add_body("Frontend – frontend/Dockerfile (Multi-Stage Build):", bold_prefix="")
    add_code_block(
"""# Build Stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]"""
    )

    add_body("Backend – backend/Dockerfile:", bold_prefix="")
    add_code_block(
"""FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]"""
    )

    add_body("Step 3: Create .dockerignore file")
    add_code_block(
"""node_modules
npm-debug.log
dist
build
.env
.git
.dockerignore"""
    )

    add_body("Step 4: Build Docker Images")
    add_body("Open two separate terminal windows for frontend and backend builds:")
    add_body("Backend Build:\ncd backend\ndocker build -t <username>/prepcycle-backend:latest .", bold_prefix="Backend: ")
    add_body("Frontend Build:\ncd frontend\ndocker build -t <username>/prepcycle-frontend:latest .", bold_prefix="Frontend: ")

    add_body("Step 5: Run Containers Locally")
    add_body("1. Create a bridge network or link containers:\ndocker network create prepcycle-net", bold_prefix="Network: ")
    add_body("2. Run MongoDB & Backend Container:\ndocker run -d --name prepcycle-backend -p 5000:5000 --network prepcycle-net -e PORT=5000 -e CLIENT_URL=http://localhost:3000 <username>/prepcycle-backend:latest", bold_prefix="Backend: ")
    add_body("3. Run Frontend Nginx Container:\ndocker run -d --name prepcycle-frontend -p 3000:80 --network prepcycle-net <username>/prepcycle-frontend:latest", bold_prefix="Frontend: ")
    add_body("4. Open Browser:\n• http://localhost:3000 → PrepCycle Exam Preparation UI\n• http://localhost:5000/api/health → PrepCycle Backend API Health Endpoint")

    add_body("Step 6: Push Project to GitHub")
    add_code_block(
"""1. Initialize Git and stage files:
   git init
   git add .
2. Commit changes:
   git commit -m "Containerize PrepCycle MERN application with Docker"
3. Set branch and remote:
   git branch -M main
   git remote add origin https://github.com/<username>/prepcycle.git
4. Push to GitHub:
   git push -u origin main
5. Verify that repository, Dockerfiles, and .dockerignore are visible on GitHub."""
    )

    add_body("Step 7: Push Images to Docker Hub")
    add_code_block(
"""1. Log in to Docker Hub:
   docker login
2. Tag the images with repository version tags:
   docker tag <username>/prepcycle-backend:latest <username>/prepcycle-backend:v1
   docker tag <username>/prepcycle-frontend:latest <username>/prepcycle-frontend:v1
3. Push images to Docker Hub:
   docker push <username>/prepcycle-backend:v1
   docker push <username>/prepcycle-frontend:v1
4. Verify uploaded tags in Docker Hub repository dashboard."""
    )

    add_body("Step 8: Testing and Validation")
    add_body("• Pull the published images onto another machine or test VM:\n"
             "  docker pull <username>/prepcycle-frontend:v1\n"
             "  docker pull <username>/prepcycle-backend:v1\n"
             "• Run containers to confirm PrepCycle functions identically with zero environment mismatches.")

    # Project Structure
    add_heading("Project Structure:")
    add_code_block(
"""prepcycle/
├── backend/
│   ├── config/             # Database connection (db.js)
│   ├── controllers/        # Business logic controllers
│   ├── data/               # Seed data for exams, users, catalog
│   ├── middleware/         # Auth, JWT, rate-limit middleware
│   ├── models/             # Mongoose schemas (User, Exam, Order, etc.)
│   ├── routes/             # Express API route declarations
│   ├── services/           # AI chatbot, order tracking, auth services
│   ├── .dockerignore       # Docker exclusion rules
│   ├── Dockerfile          # Backend Node.js container recipe
│   ├── package.json        # Dependencies & start scripts
│   └── server.js           # Main Express server entrypoint
├── frontend/
│   ├── dist/               # Compiled production assets
│   ├── public/             # Static icons & logos
│   ├── src/                # React components, pages, context, hooks
│   ├── .dockerignore       # Frontend Docker ignore
│   ├── Dockerfile          # Multi-stage build & Nginx deployment
│   ├── package.json        # Frontend dependencies & Vite config
│   └── vite.config.js      # Vite build configurations
├── docker-compose.yml       # Multi-container orchestration (optional)
└── README.md               # Documentation and setup instructions"""
    )

    # Server Code
    add_heading("Code: backend/server.js")
    server_js_code = """import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import { seedDefaultAdmin, seedStudents } from "./data/seed.js";
import { seedCatalog } from "./data/seedCatalog.js";

import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import plannerRoutes from "./routes/plannerRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import flashcardRoutes from "./routes/flashcardRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import mockAttemptRoutes from "./routes/mockAttemptRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { rateLimit } from "./middleware/rateLimit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use(rateLimit({ windowMs: 60_000, max: 180 }));

// Database readiness check
app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database connection initializing." });
  }
  next();
});

// PrepCycle Core API Endpoints
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/mock-attempts", mockAttemptRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/chat", chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

async function start() {
  app.listen(PORT, async () => {
    console.log(`[server] PrepCycle backend listening on http://localhost:${PORT}`);
    await connectDB();
    await seedDefaultAdmin();
    await seedStudents();
    await seedCatalog();
    console.log("[server] All seed data initialized.");
  });
}

start();"""
    add_code_block(server_js_code)

    # Environment Configuration
    add_heading("Environment Configuration (.env):")
    add_code_block(
"""PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://host.docker.internal:27017/prepcycle
JWT_SECRET=prepcycle_super_secure_jwt_token_2026
CLIENT_URL=http://localhost:3000
DEFAULT_ADMIN_EMAIL=admin@prepcycle.com
DEFAULT_ADMIN_PASSWORD=Admin@12345"""
    )

    # Output & Verification
    add_heading("Execution and Output Verification:")
    add_body("1. Docker Build Output (Backend):\n"
             "   • Command: docker build -t <username>/prepcycle-backend:latest .\n"
             "   • Verification: Successfully tagged <username>/prepcycle-backend:latest. Image size optimized via Alpine Linux base.", bold_prefix="")
    
    add_body("2. Docker Build Output (Frontend):\n"
             "   • Command: docker build -t <username>/prepcycle-frontend:latest .\n"
             "   • Verification: Multi-stage build completed. Vite produced static bundle in /app/dist, copied cleanly into Nginx /usr/share/nginx/html.", bold_prefix="")

    add_body("3. Container Runtime Status:\n"
             "   • Command: docker ps\n"
             "   • Status: Both prepcycle-frontend (Port 3000->80) and prepcycle-backend (Port 5000->5000) running in Up status.", bold_prefix="")

    add_body("4. Application Verification:\n"
             "   • http://localhost:3000 → PrepCycle Authentication & Student Dashboard loaded via Nginx.\n"
             "   • http://localhost:5000/api/health → Returned JSON {\"status\":\"healthy\",\"database\":\"connected\"}.\n"
             "   • Features verified: Single login routing (Student/Admin/Delivery), Exam Explorer, Subject roadmaps, Flashcard & Quiz engines, and Marketplace checkout.", bold_prefix="")

    add_body("5. Docker Hub Publishing:\n"
             "   • Commands executed: docker push <username>/prepcycle-backend:v1 and docker push <username>/prepcycle-frontend:v1.\n"
             "   • Verification: Confirmed active public repository tags on Docker Hub dashboard.", bold_prefix="")

    # Rubrics Table
    add_heading("Rubrics:")
    rubric_table = doc.add_table(rows=2, cols=7)
    rubric_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    rubric_table.autofit = False

    headers = [
        "Problem understanding & approach\n(10)",
        "Implementation and execution\n(15)",
        "Tool/ Technology usage\n(10)",
        "Code quality & Documentation\n(5)",
        "Time Management\n(5)",
        "Viva\n(5)",
        "Total\n(50)"
    ]

    widths = [Inches(1.2), Inches(1.3), Inches(1.1), Inches(1.1), Inches(0.9), Inches(0.6), Inches(0.8)]

    for col_idx, text in enumerate(headers):
        cell = rubric_table.cell(0, col_idx)
        cell.width = widths[col_idx]
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.bold = True
        r.font.size = Pt(9.5)

    for col_idx in range(7):
        cell = rubric_table.cell(1, col_idx)
        cell.width = widths[col_idx]
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run("")
        r.font.name = "Times New Roman"
        r.font.size = Pt(10)

    add_title_box(rubric_table)

    doc.add_paragraph() # Spacer

    # Result
    add_heading("Result:")
    add_body("The PrepCycle full-stack MERN application was successfully containerized, verified locally using Docker containers, and published to Docker Hub. The project codebase and configuration were committed and pushed to GitHub for centralized version control. Multi-stage Docker builds ensured lightweight image sizes and streamlined deployment, allowing the entire PrepCycle platform (Exam Explorer, Progress Tracking, and Resource Exchange) to run reliably and portably across any environment.")

    # Save docx
    filename = "PrepCycle_DevOps_Ex10_Docker_Lab_Report.docx"
    doc.save(filename)
    print(f"Report saved successfully as {filename}")

if __name__ == "__main__":
    create_report()
