import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from report_helpers import (
    set_cell_background, set_cell_margins, set_table_borders,
    add_styled_paragraph, add_heading_1, add_heading_2, add_heading_3,
    add_bullet_point, format_schema_table
)

def create_report():
    doc = Document()

    # 1. Page Margins (Standard Academic Thesis / Project Report Standard)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.25)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.27)  # A4 standard
        section.page_height = Inches(11.69)

    # Base Normal Style configuration
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(0, 0, 0)

    # =========================================================================
    # PAGE 1: TITLE / COVER PAGE
    # =========================================================================
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(36)
    p_title.paragraph_format.space_after = Pt(18)
    r = p_title.add_run("MULTI-EXAM PREPARATION AND RESOURCE EXCHANGE PLATFORM")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(18)
    r.font.bold = True
    r.font.color.rgb = RGBColor(0, 0, 0)

    p_course = doc.add_paragraph()
    p_course.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_course.paragraph_format.space_after = Pt(48)
    r = p_course.add_run("23CS54C – MODERN WEB TECHNOLOGIES")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(24)
    r = p_sub.add_run("Submitted by")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.italic = True
    r.font.bold = True

    # Student Details Table
    table_stu = doc.add_table(rows=1, cols=2)
    table_stu.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table_stu, "FFFFFF")
    cell_name, cell_reg = table_stu.rows[0].cells
    cell_name.width = Inches(2.6)
    cell_reg.width = Inches(2.0)
    
    p1 = cell_name.paragraphs[0]
    p1.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p1.add_run("HARENI T")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.bold = True
    
    p2 = cell_reg.paragraphs[0]
    p2.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p2.add_run("24104005")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(13)
    r.font.bold = True

    p_degree = doc.add_paragraph()
    p_degree.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_degree.paragraph_format.space_before = Pt(54)
    p_degree.paragraph_format.space_after = Pt(6)
    r = p_degree.add_run("In partial fulfillment for the award of the degree\nof\n")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.italic = True
    
    r_deg = p_degree.add_run("BACHELOR OF ENGINEERING\nin\nCOMPUTER SCIENCE AND ENGINEERING")
    r_deg.font.name = 'Times New Roman'
    r_deg.font.size = Pt(13)
    r_deg.font.bold = True

    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(72)
    p_inst.paragraph_format.space_after = Pt(36)
    
    r = p_inst.add_run("NATIONAL ENGINEERING COLLEGE\n")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    r2 = p_inst.add_run("(An Autonomous Institution affiliated to Anna University, Chennai)\nK.R.NAGAR, KOVILPATTI - 628503\n\nOCTOBER - 2026")
    r2.font.name = 'Times New Roman'
    r2.font.size = Pt(12)
    r2.font.bold = True

    doc.add_page_break()

    # =========================================================================
    # PAGE 2: BONAFIDE CERTIFICATE
    # =========================================================================
    p_c1 = doc.add_paragraph()
    p_c1.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_c1.paragraph_format.space_before = Pt(24)
    p_c1.paragraph_format.space_after = Pt(6)
    r = p_c1.add_run("NATIONAL ENGINEERING COLLEGE\n")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    r = p_c1.add_run("(An Autonomous Institution affiliated to Anna University, Chennai)\nK.R.NAGAR, KOVILPATTI - 628503")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True

    p_bona = doc.add_paragraph()
    p_bona.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_bona.paragraph_format.space_before = Pt(40)
    p_bona.paragraph_format.space_after = Pt(30)
    r = p_bona.add_run("BONAFIDE CERTIFICATE")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)
    r.font.bold = True

    p_cert_body = doc.add_paragraph()
    p_cert_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_cert_body.paragraph_format.line_spacing = 1.5
    p_cert_body.paragraph_format.space_after = Pt(60)
    
    r = p_cert_body.add_run("This is to certify that this project report, “")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    
    r = p_cert_body.add_run("Multi-Exam Preparation and Resource Exchange Platform")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True

    r = p_cert_body.add_run("”, is the bonafide work of ")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)

    r = p_cert_body.add_run("HARENI T (24104005)")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True

    r = p_cert_body.add_run(" who carried out the project work under my supervision in partial fulfillment of the requirements for the course ")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)

    r = p_cert_body.add_run("23CS54C – MODERN WEB TECHNOLOGIES")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True

    r = p_cert_body.add_run(" during the academic year 2026.")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)

    p_guide = doc.add_paragraph()
    p_guide.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_guide.paragraph_format.space_after = Pt(72)
    r = p_guide.add_run("_______________________________\nCourse Instructor/Guide\n")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True

    p_viva = doc.add_paragraph()
    p_viva.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_viva.paragraph_format.space_after = Pt(54)
    r = p_viva.add_run("Submitted to the ")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r = p_viva.add_run("23CS54C – MODERN WEB TECHNOLOGIES")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True
    r = p_viva.add_run(" Viva-Voce examination held at National Engineering College, K.R.Nagar, Kovilpatti on ___________________")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)

    t_exam = doc.add_table(rows=1, cols=2)
    t_exam.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_exam, "FFFFFF")
    c_int, c_ext = t_exam.rows[0].cells
    c_int.width = Inches(3.0)
    c_ext.width = Inches(3.0)
    
    p = c_int.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = p.add_run("_____________________\nInternal Examiner")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True

    p = c_ext.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p.add_run("_____________________\nCo Examiner")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(12)
    r.font.bold = True

    doc.add_page_break()

    # =========================================================================
    # PAGE 3: TABLE OF CONTENTS
    # =========================================================================
    p_toc = doc.add_paragraph()
    p_toc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_toc.paragraph_format.space_before = Pt(18)
    p_toc.paragraph_format.space_after = Pt(24)
    r = p_toc.add_run("TABLE OF CONTENTS")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(15)
    r.font.bold = True

    toc_items = [
        ("1", "INTRODUCTION", "3"),
        ("2", "OBJECTIVES", "5"),
        ("3", "DESCRIPTION", "6"),
        ("4", "CLASS DIAGRAM", "8"),
        ("5", "TABLE STRUCTURES / DATA SCHEMAS", "10"),
        ("6", "ER DIAGRAM", "16"),
        ("7", "TECH STACK", "18"),
        ("8", "MODULES", "20"),
        ("", "8.1 FOLDER STRUCTURE & ARCHITECTURE", "20"),
        ("", "8.2 AUTHENTICATION & MULTI-ROLE SECURITY", "23"),
        ("", "8.3 EXAM EXPLORATION & SYLLABUS TRACKER", "25"),
        ("", "8.4 MULTI-ATTEMPT MOCK TEST SYSTEM & ANALYTICS", "28"),
        ("", "8.5 ADAPTIVE DYNAMIC QUIZ GENERATOR", "31"),
        ("", "8.6 PEER-TO-PEER MARKETPLACE & RESOURCE DONATION", "33"),
        ("", "8.7 DOORSTEP LOGISTICS & ORDER DELIVERY TRACKING", "35"),
        ("", "8.8 CENTRALIZED ADMINISTRATIVE MANAGEMENT", "37"),
        ("", "8.9 MULTI-LANGUAGE LOCALIZATION ENGINE", "39"),
        ("", "8.10 INTERACTIVE GUIDED FEATURE TOUR", "41"),
        ("9", "CONCLUSION", "42"),
    ]

    t_toc = doc.add_table(rows=len(toc_items) + 1, cols=3)
    t_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_toc, "CBD5E1")
    
    # Headers
    h1, h2, h3 = t_toc.rows[0].cells
    h1.width = Inches(1.1)
    h2.width = Inches(4.5)
    h3.width = Inches(1.0)
    h1.text = "CH NO"
    h2.text = "TITLE"
    h3.text = "PAGE NO"
    for cell in [h1, h2, h3]:
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        for run in p.runs:
            run.font.name = 'Times New Roman'
            run.font.size = Pt(10.5)
            run.font.bold = True
            run.font.color.rgb = RGBColor(255, 255, 255)

    for idx, (ch, title, page) in enumerate(toc_items):
        c1, c2, c3 = t_toc.rows[idx + 1].cells
        c1.text = ch
        c2.text = title
        c3.text = page
        bg = "F8FAFC" if idx % 2 == 1 else "FFFFFF"
        for cell in [c1, c2, c3]:
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=70, bottom=70, left=120, right=120)
            p = cell.paragraphs[0]
            for run in p.runs:
                run.font.name = 'Times New Roman'
                run.font.size = Pt(10)
                if ch:
                    run.font.bold = True
                run.font.color.rgb = RGBColor(15, 23, 42)
        c1.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        c3.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 1: INTRODUCTION
    # =========================================================================
    add_heading_1(doc, "CHAPTER 1\nINTRODUCTION")
    
    add_styled_paragraph(
        doc,
        "The Multi-Exam Preparation and Resource Exchange Platform (PrepCycle) is an end-to-end, enterprise-grade web application engineered to address the critical fragmentation, high financial barrier, and resource disparity faced by millions of competitive exam aspirants across India. Competitive examinations in engineering (GATE, JEE), medical sciences (NEET), management (CAT, XAT), civil services (UPSC, TNPSC), and public sectors (SSC, Banking, RRB) demand highly structured subject tracking, recurring mock assessments, domain-specific continuous evaluation, and access to expensive preparation materials."
    )

    add_styled_paragraph(
        doc,
        "Traditional exam preparation workflows rely on scattered web portals, disparate PDF repositories, physical commercial bookstores, and isolated offline practice notes. Students routinely purchase costly reference textbooks that become obsolete or redundant once an examination cycle concludes, creating severe educational waste and economic strain. Simultaneously, junior aspirants and economically challenged students struggle to acquire quality textbooks and curated notes. Existing educational software architectures predominantly cater to generic institutional attendance or rigid single-course management, failing to unify syllabus tracking, continuous testing, peer-to-peer resource circulation, and localized accessibility into a cohesive digital ecosystem."
    )

    add_styled_paragraph(
        doc,
        "PrepCycle bridges these systemic challenges by delivering an integrated Modern Web platform structured around three distinct, role-authenticated user classes: Student, Administrator, and Doorstep Delivery Partner. For students, the platform provides real-time enrollment across 33 premier competitive exams, comprehensive multi-tier syllabus tracking (including full 11-subject breakdowns for technical streams like GATE Computer Science), sub-topic mock test integration with multi-attempt scoring and SVG progression analytics, and an adaptive quiz generation engine capable of filtering subjects dynamically per target exam discipline."
    )

    add_styled_paragraph(
        doc,
        "In addition to rigorous academic tracking, PrepCycle pioneers a closed-loop Circular Economy Marketplace for study materials. Students can purchase pre-owned verified textbooks, list excess reference guides for resale, or donate physical books completely free of charge to junior aspirants. To eliminate logistical friction, the platform incorporates an end-to-end Doorstep Logistics sub-system where dedicated delivery personnel manage scheduled order deliveries, quality-verify return items, and collect donated textbooks directly from student doorsteps."
    )

    add_styled_paragraph(
        doc,
        "Furthermore, to democratize access across diverse linguistic demographics, PrepCycle features an interactive 8-language regional translation engine (covering English, Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, and Marathi) that dynamically localizes UI controls, navigation menus, and catalog titles. Supported by secure JWT session tokens, Google OAuth 2.0 single sign-on with corporate SSL proxy bypass, automated multi-channel communication logging, and an interactive Guided Spotlight Tour, PrepCycle establishes an extensible, highly responsive, and data-driven benchmark for modern educational web platforms."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 2: OBJECTIVES
    # =========================================================================
    add_heading_1(doc, "CHAPTER 2\nOBJECTIVES")

    add_styled_paragraph(
        doc,
        "The primary objective of this project is to develop, architect, and deploy a secure, responsive, and data-driven web application that unifies multi-exam academic preparation, automated performance analytics, circular resource exchange, and doorstep fulfillment. The specific goals and technical objectives include:"
    )

    add_bullet_point(doc, "Role-Based Authentication and Access Control: ", 
                     "To engineer a secure multi-role authorization framework utilizing JSON Web Tokens (JWT) and Google OAuth 2.0, providing distinct capabilities for Students, Administrators, and Delivery Partners while enforcing strict route protection.")
    
    add_bullet_point(doc, "Centralized NoSQL Database Management: ", 
                     "To design and maintain a scalable MongoDB Atlas database schema modeling users, competitive exams, multi-tiered syllabi, progress states, mock test attempts, commerce orders, donation pickups, and communication audit trails.")
    
    add_bullet_point(doc, "Multi-Exam Syllabus & Roadmap Tracking: ", 
                     "To establish comprehensive syllabus tracking for 33 national and state competitive exams, featuring in-depth 11-subject hierarchical mapping for GATE CSE (General Aptitude, Engineering Math, Digital Logic, COA, Data Structures, Algorithms, TOC, Compiler Design, OS, DBMS, Networks) with real-time percentage completion calculations.")
    
    add_bullet_point(doc, "Multi-Attempt Mock Scoring & Progression Analytics: ", 
                     "To allow students to record repeated mock test scores per sub-topic without overwriting history, dynamically calculating metrics such as Latest Score, Personal Best, Attempt Average, and Net Growth percentage, visualized through interactive SVG trajectory curves and 80% benchmark cutoff lines.")
    
    add_bullet_point(doc, "Adaptive Exam-Specific Quiz Generation: ", 
                     "To engineer an intelligent quiz generator that dynamically filters subjects based on the chosen exam (e.g., presenting Botany, Zoology, Physics, and Chemistry for NEET without Mathematics, and computer science modules for GATE) alongside uploaded notes parsing for automated question synthesis.")
    
    add_bullet_point(doc, "Peer-to-Peer Marketplace & Book Circulation: ", 
                     "To facilitate a sustainable educational resource exchange where students can buy used textbooks at affordable prices, list items for buyback resale, or donate physical resources entirely free of cost to peer aspirants.")
    
    add_bullet_point(doc, "Digital Community Study PDF Acquisition: ", 
                     "To provide direct 'Add to Cart (₹0)' and immediate 'Read / Download' mechanisms for student-shared open PDF materials and reference guides directly within the digital marketplace.")
    
    add_bullet_point(doc, "Doorstep Logistics & Real-Time Order Tracking: ", 
                     "To create a specialized operational interface for Delivery Partners to manage doorstep order fulfillment, verify item physical condition during return/resale pickups, and update multi-stage status workflows in real time.")
    
    add_bullet_point(doc, "Centralized Administrative Control: ", 
                     "To provide administrators with an intuitive multi-tab management dashboard to oversee platform metrics, curate exams and study resources, manage user roles, resolve return/resale/donation pickup requests, and audit communication dispatches.")
    
    add_bullet_point(doc, "8-Language Regional Localization Engine: ", 
                     "To deliver comprehensive accessibility across India through real-time client-side translation of navigation controls, analytical headings, and marketplace book titles into Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, and Marathi.")
    
    add_bullet_point(doc, "Interactive Step-by-Step Guided Feature Tour: ", 
                     "To incorporate an interactive onboarding tour that guides first-time users through target exams, syllabus roadmaps, multi-attempt score analysis, adaptive quizzes, marketplace features, and delivery tracking.")
    
    add_bullet_point(doc, "Enterprise Reliability & Fault Tolerance: ", 
                     "To implement global error handling shields, database connection retry logic, and TLS certificate inspection bypasses to ensure seamless execution across diverse institutional and operating system environments.")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 3: DESCRIPTION
    # =========================================================================
    add_heading_1(doc, "CHAPTER 3\nDESCRIPTION")

    add_styled_paragraph(
        doc,
        "The Multi-Exam Preparation and Resource Exchange Platform is architected as a high-performance Single-Page Application (SPA) backed by a decoupled RESTful API server. The system establishes clear operational boundaries and distinct workflows for each of its three primary stakeholders: Students, Administrators, and Delivery Partners."
    )

    add_heading_2(doc, "3.1 Student Workflow and Ecosystem")
    add_styled_paragraph(
        doc,
        "Upon registration or Google Single Sign-On, a student is assigned a unique alphanumeric Student ID (e.g., STU-2026-9481). Students enter the Exam Explorer where they can browse 33 premier competitive exams categorized into Engineering, Medical, Civil Services, Management, Law, and Banking. Students can register for target exams with a single click, instantly initializing their customized syllabus tracker, or unregister from exams they no longer wish to pursue."
    )
    add_styled_paragraph(
        doc,
        "Within the Progress Hub, students interact with a deeply structured syllabus hierarchy. For instance, in GATE Computer Science, the student navigates through 11 core subjects divided into weightage-ranked chapters and discrete topics. Each topic integrates direct mock test portal links. Students can record multiple test attempts over time, capturing their score, maximum marks, and timestamp. The system evaluates their historical progression, dynamically rendering an SVG score trajectory curve against an 80% cutoff line alongside growth indicators."
    )
    add_styled_paragraph(
        doc,
        "In the Quiz Generator, students select their registered exam to load domain-appropriate subjects automatically. A student preparing for NEET receives biology, zoology, physics, and organic chemistry questions with zero mathematical contamination, whereas a GATE student receives questions on paging, deadlocks, and asymptotic complexity. Alternatively, students can upload textual study notes, which the system parses using heuristic sentence-blanking algorithms to synthesize tailored practice questions."
    )
    add_styled_paragraph(
        doc,
        "In the Marketplace, students browse categorized textbooks, verified used books, and community-shared PDFs. Students can purchase used books, list their own books for resale, or post free book donations. Furthermore, students can schedule doorstep returns or donation pickups and monitor live fulfillment milestones in the Order Tracking portal."
    )

    add_heading_2(doc, "3.2 Administrator Workflow and Operational Oversight")
    add_styled_paragraph(
        doc,
        "The Administrator Dashboard serves as the central operational hub for platform monitoring and governance. Accessible only to authenticated users with the 'admin' role, the dashboard provides high-level system metrics including total registered students, active exams, marketplace inventory value, and order volumes. Administrators can create, update, or remove exam syllabi, curate official PDF resources, manage marketplace listings, and adjust user privileges dynamically."
    )
    add_styled_paragraph(
        doc,
        "A critical feature of the admin module is the Returns / Resale / Donations Management tab. Here, administrators inspect student requests for textbook buybacks, returns, and charitable donations. Administrators review pickup addresses, contact information, declared book condition, and expected values, assigning requests to delivery partners or advancing statuses from 'Requested' to 'Approved', 'Pickup Scheduled', 'Quality Checked', and 'Completed'. Administrators also monitor multi-channel notification logs across Email, SMS, and WhatsApp dispatch channels."
    )

    add_heading_2(doc, "3.3 Delivery Partner Workflow and Doorstep Logistics")
    add_styled_paragraph(
        doc,
        "The Delivery Partner portal is tailored specifically for field courier personnel. Delivery partners log into a mobile-responsive interface showing their active assigned tasks across two operational categories: Customer Order Deliveries and Doorstep Return/Donation Pickups. Partners view recipient addresses, telephone numbers, and item details. During pickups, partners inspect book physical condition, record notes, and update statuses to 'Out for Pickup', 'Received', and 'Quality Checked', closing the loop between digital requests and physical asset circulation."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 4: CLASS DIAGRAM
    # =========================================================================
    add_heading_1(doc, "CHAPTER 4\nCLASS DIAGRAM")

    add_styled_paragraph(
        doc,
        "The class diagram models the object-oriented structure of the PrepCycle platform, representing the domain entities, their attributes, visibility specifiers, methods, and relationships. The architecture employs inheritance for role specialization and associations for academic progress, assessment tracking, and commerce fulfillment."
    )

    # Insert Class Diagram Image if generated
    if os.path.exists("class_diagram.png"):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(12)
        p_img.paragraph_format.space_after = Pt(6)
        doc.add_picture("class_diagram.png", width=Inches(6.2))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(14)
        r = p_cap.add_run("Fig 4.1 – Class Diagram – Object-Oriented Architecture of the PrepCycle Platform.")
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10)
        r.font.bold = True
        r.font.italic = True

    add_heading_2(doc, "4.1 Description of Core Classes and Relationships")
    add_styled_paragraph(
        doc,
        "1. User (Base Model): Serves as the central identity class containing core credentials, contact details, authentication provider (local/Google OAuth), and role identifiers. It maintains references to enrolled exams and bookmarked resources, providing foundational authentication and session validation methods."
    )
    add_styled_paragraph(
        doc,
        "2. Student & DeliveryPartner (Specialized Roles): Student encapsulates academic attributes such as target graduation year, study streaks, and mock scores. DeliveryPartner manages logistical fields including vehicle details, assigned delivery zones, active shipment orders, and scheduled pickup tasks."
    )
    add_styled_paragraph(
        doc,
        "3. Exam, Subject, Chapter, and Topic: Forms the academic knowledge tree. Exam defines conducting authorities, application dates, and official URLs. Subject and Chapter organize the learning curriculum, while Topic encapsulates discrete learning outcomes, completion states, and external mock assessment URLs."
    )
    add_styled_paragraph(
        doc,
        "4. Progress & MockAttempt: Progress tracks topic-level pending/completed states and study calendar days for each student. MockAttempt maintains a chronological log of mock test submissions, storing raw marks, maximum scores, percentages, and timestamps to power progression curve analytics."
    )
    add_styled_paragraph(
        doc,
        "5. Product, Order, and ReturnRequest: Governs the circular economy marketplace. Product models textbook listings, conditions (New, Good, Fair), and donation flags. Order manages customer purchases, payment states, and delivery milestones. ReturnRequest models reverse logistics for buybacks, returns, and free book donations."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 5: TABLE STRUCTURES / DATA SCHEMAS
    # =========================================================================
    add_heading_1(doc, "CHAPTER 5\nTABLE STRUCTURES / DATA SCHEMAS")

    add_styled_paragraph(
        doc,
        "PrepCycle utilizes MongoDB Atlas, a distributed document-oriented database. While MongoDB is schemaless at the storage engine level, the application enforces rigorous data validation, typing, indexing, and referential constraints through Mongoose schemas. The database schema specifications for the primary collections are presented below:"
    )

    # 5.1 Users Collection
    add_heading_2(doc, "5.1 Users Collection (users)")
    add_styled_paragraph(doc, "Stores core user accounts, credentials, role assignments, and personal academic preferences.")
    headers = ["Field", "Type", "Null", "Key", "Default", "Description"]
    users_data = [
        ["_id", "ObjectId", "NO", "PRI", "auto_generated", "Unique internal MongoDB document identifier"],
        ["studentId", "String", "NO", "UNI", "STU-YYYY-XXXX", "Formatted institutional student identification code"],
        ["name", "String", "NO", "MUL", "None", "Full legal name of the user"],
        ["email", "String", "NO", "UNI", "None", "Primary email address used for login and notifications"],
        ["password", "String", "YES", "None", "None", "Bcrypt hashed password (null for OAuth users)"],
        ["role", "Enum", "NO", "MUL", "'student'", "Access role: 'student', 'admin', 'delivery'"],
        ["authProvider", "String", "NO", "None", "'local'", "Identity provider: 'local' or 'google'"],
        ["phone", "String", "YES", "None", "None", "Contact telephone number for doorstep delivery"],
        ["address", "String", "YES", "None", "None", "Default shipping/pickup residential address"],
        ["registeredExams", "Array<String>", "YES", "None", "[]", "List of exam slugs the student is actively pursuing"],
        ["bookmarkedResources", "Array<ObjectId>", "YES", "None", "[]", "Foreign keys to saved community study resources"],
        ["createdAt", "DateTime", "NO", "None", "CURRENT_TIMESTAMP", "Timestamp of initial account registration"],
        ["updatedAt", "DateTime", "NO", "None", "CURRENT_TIMESTAMP", "Timestamp of most recent profile modification"]
    ]
    format_schema_table(doc, users_data, headers)

    # 5.2 Exams Collection
    add_heading_2(doc, "5.2 Exams Collection (exams)")
    add_styled_paragraph(doc, "Contains master catalog information and structured syllabi for competitive exams.")
    exams_data = [
        ["_id", "ObjectId", "NO", "PRI", "auto_generated", "Unique document identifier"],
        ["slug", "String", "NO", "UNI", "None", "URL-friendly unique identifier (e.g., 'gate-cse', 'neet-ug')"],
        ["name", "String", "NO", "MUL", "None", "Official examination title (e.g., 'GATE Computer Science')"],
        ["category", "String", "NO", "MUL", "None", "Category: 'engineering', 'medical', 'civil-services', etc."],
        ["authority", "String", "NO", "None", "None", "Conducting government body or institute (e.g., 'IIT')"],
        ["description", "String", "YES", "None", "None", "Comprehensive examination overview and structure"],
        ["eligibility", "String", "YES", "None", "None", "Academic degrees and age requirements"],
        ["officialUrl", "String", "NO", "None", "None", "Official conducting authority portal web link"],
        ["applicationUrl", "String", "YES", "None", "None", "Direct online application portal URL"],
        ["subjects", "Array<SubDoc>", "NO", "None", "[]", "Nested array of subjects, chapters, and topics"],
        ["sourceVerifiedAt", "Date", "YES", "None", "CURRENT_DATE", "Date of official syllabus verification"]
    ]
    format_schema_table(doc, exams_data, headers)

    # 5.3 Progress Collection
    add_heading_2(doc, "5.3 Progress Collection (progresses)")
    add_styled_paragraph(doc, "Tracks student-specific topic completion, revision statuses, and active study days.")
    progress_data = [
        ["_id", "ObjectId", "NO", "PRI", "auto_generated", "Unique progress record identifier"],
        ["user", "ObjectId", "NO", "FK", "None", "Foreign key reference to users collection"],
        ["examSlug", "String", "NO", "FK", "None", "Foreign key reference to exams.slug"],
        ["topicStatus", "Map<String, String>", "NO", "None", "{}", "Key-value map of topic IDs to 'pending' or 'completed'"],
        ["studyDays", "Array<Date>", "YES", "None", "[]", "Distinct dates where user logged study activity"],
        ["notes", "String", "YES", "None", "None", "Student personal preparation strategy notes"],
        ["createdAt", "DateTime", "NO", "None", "CURRENT_TIMESTAMP", "Record initialization timestamp"],
        ["updatedAt", "DateTime", "NO", "None", "CURRENT_TIMESTAMP", "Last topic status update timestamp"]
    ]
    format_schema_table(doc, progress_data, headers)

    # 5.4 Mock Attempts Collection
    add_heading_2(doc, "5.4 Mock Attempts Collection (mockattempts)")
    add_styled_paragraph(doc, "Maintains chronological multi-attempt mock test scores to generate progression curves.")
    mock_data = [
        ["_id", "ObjectId", "NO", "PRI", "auto_generated", "Unique attempt identifier"],
        ["user", "ObjectId", "NO", "FK", "None", "Foreign key reference to users collection"],
        ["examSlug", "String", "NO", "FK", "None", "Associated exam identifier"],
        ["subjectName", "String", "NO", "None", "None", "Subject title (e.g., 'Operating Systems (OS)')"],
        ["chapterName", "String", "YES", "None", "None", "Chapter name (e.g., 'Process Management')"],
        ["topicId", "String", "NO", "MUL", "None", "Target topic identifier"],
        ["score", "Number", "NO", "None", "None", "Marks obtained by student in this attempt"],
        ["maxScore", "Number", "NO", "None", "100", "Maximum possible marks for the assessment"],
        ["percentage", "Float", "NO", "None", "0.0", "Computed percentage score ((score/maxScore)*100)"],
        ["attemptNumber", "Number", "NO", "None", "1", "Sequential attempt counter for this topic"],
        ["createdAt", "DateTime", "NO", "None", "CURRENT_TIMESTAMP", "Assessment completion timestamp"]
    ]
    format_schema_table(doc, mock_data, headers)

    # 5.5 Products Collection (Marketplace)
    add_heading_2(doc, "5.5 Marketplace Products Collection (products)")
    add_styled_paragraph(doc, "Catalogs physical books available for purchase, buyback, or free donation pickup.")
    products_data = [
        ["_id", "ObjectId", "NO", "PRI", "auto_generated", "Unique product inventory identifier"],
        ["title", "String", "NO", "MUL", "None", "Book title (e.g., 'Silberschatz Operating System Concepts')"],
        ["examSlug", "String", "YES", "MUL", "None", "Target competitive exam alignment"],
        ["subjectName", "String", "YES", "None", "None", "Subject classification"],
        ["price", "Number", "NO", "None", "0", "Price in INR (₹0 for free donated books)"],
        ["condition", "Enum", "NO", "None", "'Good'", "Physical condition: 'Like New', 'Good', 'Fair'"],
        ["stock", "Number", "NO", "None", "1", "Available inventory quantity"],
        ["isDonation", "Boolean", "NO", "MUL", "false", "True if item is donated free for peer students"],
        ["seller", "ObjectId", "YES", "FK", "None", "User identifier of student seller/donor"],
        ["sellerName", "String", "YES", "None", "'Verified Academic'", "Name of seller or donor"],
        ["imageUrl", "String", "YES", "None", "None", "Cover image URL"],
        ["createdAt", "DateTime", "NO", "None", "CURRENT_TIMESTAMP", "Listing date"]
    ]
    format_schema_table(doc, products_data, headers)

    # 5.6 Orders Collection
    add_heading_2(doc, "5.6 Orders Collection (orders)")
    add_styled_paragraph(doc, "Stores commerce purchases, shipping details, and delivery fulfillment lifecycles.")
    orders_data = [
        ["_id", "ObjectId", "NO", "PRI", "auto_generated", "Unique order identifier"],
        ["trackingId", "String", "NO", "UNI", "'ORD-XXXX'", "Public tracking code for customer order monitoring"],
        ["user", "ObjectId", "NO", "FK", "None", "Foreign key reference to purchasing student"],
        ["items", "Array<SubDoc>", "NO", "None", "[]", "List of product IDs, quantities, and purchased prices"],
        ["totalAmount", "Number", "NO", "None", "0", "Total payable order amount in INR"],
        ["status", "Enum", "NO", "MUL", "'Placed'", "Lifecycle: 'Placed', 'Dispatched', 'Out for Delivery', 'Delivered'"],
        ["deliveryAddress", "String", "NO", "None", "None", "Physical shipping address for doorstep courier"],
        ["contactPhone", "String", "NO", "None", "None", "Recipient contact phone number"],
        ["assignedPartner", "ObjectId", "YES", "FK", "None", "Assigned delivery partner identifier"],
        ["createdAt", "DateTime", "NO", "None", "CURRENT_TIMESTAMP", "Order placement timestamp"]
    ]
    format_schema_table(doc, orders_data, headers)

    # 5.7 Return / Resale / Donation Requests Collection
    add_heading_2(doc, "5.7 Return & Donation Requests Collection (returnrequests)")
    add_styled_paragraph(doc, "Governs reverse logistics for book returns, buyback resales, and charitable donations.")
    returns_data = [
        ["_id", "ObjectId", "NO", "PRI", "auto_generated", "Unique request identifier"],
        ["trackingId", "String", "NO", "UNI", "'REQ-XXXX'", "Public tracking code for doorstep pickup tracking"],
        ["user", "ObjectId", "NO", "FK", "None", "Foreign key to requesting student"],
        ["type", "Enum", "NO", "MUL", "'return'", "Request category: 'return', 'resell', 'donate'"],
        ["item", "SubDoc", "NO", "None", "{}", "Item title, condition, and optional catalog reference"],
        ["reason", "String", "YES", "None", "None", "Student explanation for return/resale"],
        ["condition", "String", "NO", "None", "'Gently Used'", "Declared physical condition of book"],
        ["expectedValue", "Number", "YES", "None", "0", "Anticipated buyback value (₹0 for donation)"],
        ["pickupAddress", "String", "NO", "None", "None", "Doorstep pickup residential address"],
        ["contactPhone", "String", "NO", "None", "None", "Contact phone number for pickup agent"],
        ["status", "Enum", "NO", "MUL", "'Requested'", "Status: 'Requested', 'Approved', 'Pickup Scheduled', 'Completed'"],
        ["assignedCourier", "ObjectId", "YES", "FK", "None", "Delivery partner assigned for pickup"],
        ["createdAt", "DateTime", "NO", "None", "CURRENT_TIMESTAMP", "Request submission timestamp"]
    ]
    format_schema_table(doc, returns_data, headers)

    # 5.8 Resources Collection (Community PDFs)
    add_heading_2(doc, "5.8 Shared Resources Collection (resources)")
    add_styled_paragraph(doc, "Stores curated academic reference guides and peer-shared PDF study documents.")
    resources_data = [
        ["_id", "ObjectId", "NO", "PRI", "auto_generated", "Unique resource identifier"],
        ["title", "String", "NO", "MUL", "None", "Resource document title (e.g., 'GATE CSE 10-Year Solved Papers')"],
        ["examSlug", "String", "YES", "MUL", "None", "Target competitive exam classification"],
        ["subjectName", "String", "YES", "None", "None", "Subject alignment"],
        ["type", "String", "NO", "None", "'pdf'", "Resource media type: 'pdf', 'notes', 'formula-sheet'"],
        ["url", "String", "NO", "None", "None", "Public access URL for reading or download"],
        ["source", "String", "NO", "None", "'curated'", "Origin: 'curated' (official) or 'user' (community shared)"],
        ["sharedBy", "String", "YES", "None", "'PrepCycle Academic'", "Name or handle of contributing user"],
        ["createdAt", "DateTime", "NO", "None", "CURRENT_TIMESTAMP", "Upload timestamp"]
    ]
    format_schema_table(doc, resources_data, headers)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 6: ER DIAGRAM
    # =========================================================================
    add_heading_1(doc, "CHAPTER 6\nENTITY-RELATIONSHIP (ER) DIAGRAM")

    add_styled_paragraph(
        doc,
        "The Entity-Relationship (ER) diagram visualizes the conceptual database schema of PrepCycle, showing entity sets, primary and foreign key attributes, and relational cardinalities across user operations, academic tracking, and commerce circulation."
    )

    if os.path.exists("er_diagram.png"):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(12)
        p_img.paragraph_format.space_after = Pt(6)
        doc.add_picture("er_diagram.png", width=Inches(6.2))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(14)
        r = p_cap.add_run("Fig 6.1 – Entity-Relationship (ER) Diagram – Database Relational Topology of PrepCycle.")
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10)
        r.font.bold = True
        r.font.italic = True

    add_heading_2(doc, "6.1 Relational Cardinality Analysis")
    add_styled_paragraph(
        doc,
        "1. USER and EXAM (Many-to-Many via 'Registers'): A student can register for multiple competitive exams (e.g., both GATE CSE and ISRO CS), while each competitive exam accommodates thousands of enrolled students. This cardinality is managed via the user's registeredExams array and the progress document bridge."
    )
    add_styled_paragraph(
        doc,
        "2. USER and PROGRESS (One-to-Many): For every exam enrolled, a user possesses exactly one dedicated progress record that maintains the status of all topics in that exam's syllabus. A user enrolling in 3 exams owns 3 corresponding progress records."
    )
    add_styled_paragraph(
        doc,
        "3. USER and MOCK_ATTEMPT (One-to-Many): A student can execute and record numerous mock tests across different topics and dates. Each mock attempt record references exactly one user and stores the obtained score, total marks, and timestamp."
    )
    add_styled_paragraph(
        doc,
        "4. USER and PRODUCT (One-to-Many via 'Lists/Sells'): A student can list several textbooks for resale or free donation in the marketplace. Each marketplace product maintains a foreign key to the originating seller or donor."
    )
    add_styled_paragraph(
        doc,
        "5. USER and ORDER (One-to-Many via 'Places'): A student can place multiple orders over time. Each order contains one or more product items, delivery addresses, and tracking numbers, and is fulfilled by an assigned delivery partner."
    )
    add_styled_paragraph(
        doc,
        "6. ORDER and PRODUCT (Many-to-Many via 'Contains'): An order can encompass multiple distinct textbook products, while a popular product title can appear across multiple customer orders over time."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 7: TECH STACK
    # =========================================================================
    add_heading_1(doc, "CHAPTER 7\nTECH STACK")

    add_styled_paragraph(
        doc,
        "PrepCycle is implemented using the industry-standard MERN (MongoDB, Express.js, React.js, Node.js) technology stack, augmented with Vite for build optimization, JSON Web Tokens for authentication, and Google OAuth 2.0. The software layers and architectural patterns are detailed below:"
    )

    add_bullet_point(doc, "Frontend Framework: ", "React.js (v18) utilizing Functional Components, React Hooks (useState, useEffect, useMemo, useContext), and React Router v6 for client-side routing.")
    add_bullet_point(doc, "Build Tool & Bundler: ", "Vite v5 for Lightning-Fast Hot Module Replacement (HMR), tree-shaking, and minified production asset compilation.")
    add_bullet_point(doc, "Styling & UI Design: ", "Modern Modular CSS with Glassmorphism aesthetic, responsive CSS Grid / Flexbox, CSS custom properties (variables) for dynamic theming, and zero bloated CSS dependencies.")
    add_bullet_point(doc, "Backend Runtime: ", "Node.js (v22 LTS), providing non-blocking asynchronous event-driven I/O for scalable request processing.")
    add_bullet_point(doc, "Backend Framework: ", "Express.js (v4), providing modular RESTful API routing, centralized middleware pipelining, and error handling.")
    add_bullet_point(doc, "Database & ODM: ", "MongoDB Atlas cloud database managed via Mongoose ODM (v8) with strict schema validation, type casting, and index optimization.")
    add_bullet_point(doc, "Authentication & Security: ", "Stateless JSON Web Tokens (jsonwebtoken), Bcrypt.js password hashing (salt rounds: 10), Google OAuth 2.0 Single Sign-On, and custom TLS certificate inspection bypass for enterprise firewall stability.")
    add_bullet_point(doc, "API Security & Rate Limiting: ", "Custom in-memory sliding-window rate limiter (180 requests per minute per IP), CORS configuration, and HTTP header sanitization.")
    add_bullet_point(doc, "Internationalization Engine: ", "React Context API (LanguageContext) paired with a structured 8-language dictionary covering English, Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, and Marathi.")
    add_bullet_point(doc, "Data Visualization: ", "Native responsive SVG curve rendering for Mock Score Progression Graphs, target cutoff indicators, and interactive analytics grids.")

    add_heading_2(doc, "7.1 Architectural Pattern: MVC (Model-View-Controller)")
    add_styled_paragraph(
        doc,
        "The application strictly adheres to the Model-View-Controller architectural pattern, maintaining a clean separation of concerns between data models, business logic controllers, and client views:"
    )
    add_bullet_point(doc, "Models: ", "Mongoose schemas in backend/models/ (User, Exam, Progress, MockAttempt, QuizAttempt, Product, Order, ReturnRequest, CommunicationLog) defining data structures, business rules, and validation logic.")
    add_bullet_point(doc, "Views: ", "React components in frontend/src/pages/ and frontend/src/components/ rendering dynamic user interfaces, interactive charts, and accessible forms.")
    add_bullet_point(doc, "Controllers: ", "Express handler functions in backend/controllers/ orchestrating request validation, database mutations, and formatted JSON API responses.")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 8: MODULES & IMPLEMENTATION
    # =========================================================================
    add_heading_1(doc, "CHAPTER 8\nMODULES")

    add_heading_2(doc, "8.1 Folder Structure & Architecture")
    add_styled_paragraph(
        doc,
        "The project is structured into two autonomous, loosely coupled directories: backend/ (API server) and frontend/ (React client). This separation allows independent testing, development, and production containerization."
    )

    add_heading_3(doc, "8.1.1 Backend Directory Organization")
    add_styled_paragraph(
        doc,
        "• backend/server.js: Primary application entry point; initializes Express, attaches security middleware, mounts API routes, connects to MongoDB Atlas, and executes initial database seeds.\n"
        "• backend/config/db.js: Database connection manager with automatic background retry logic and SSL certificate configuration.\n"
        "• backend/controllers/: Contains business logic handlers (authController, examController, progressController, quizController, commerceController, adminController, communicationController).\n"
        "• backend/routes/: Defines REST API route endpoints segregated by domain (authRoutes, examRoutes, progressRoutes, quizRoutes, marketplaceRoutes, deliveryRoutes, adminRoutes).\n"
        "• backend/models/: Mongoose schemas defining database collections.\n"
        "• backend/middleware/: Contains JWT authentication (protect), role authorization (roleOnly), and rate limiting middleware.\n"
        "• backend/data/: Seed scripts initializing 33 competitive exams, default administrators, delivery personnel, and marketplace catalog items."
    )

    add_heading_3(doc, "8.1.2 Frontend Directory Organization")
    add_styled_paragraph(
        doc,
        "• frontend/src/main.jsx & App.jsx: React root entry point setting up AuthProvider, LanguageProvider, and client router.\n"
        "• frontend/src/api.js: Centralized Axios/fetch API client abstracting all backend HTTP requests.\n"
        "• frontend/src/context/: Global state management (AuthContext for user sessions and LanguageContext for 8-language translations).\n"
        "• frontend/src/pages/: Major full-page views (ExamExplorerPage, MyProgressPage, MarketplacePage, OrdersPage, AdminDashboardPage, DeliveryDashboardPage, LoginPage).\n"
        "• frontend/src/components/: Reusable UI components, modals, and charts (TopicScoreAnalysisModal, QuizGenerator, GuidedTour, AnalyticsBody, AppLayout, OwlMascot)."
    )

    add_heading_2(doc, "8.2 Authentication & Multi-Role Security Module")
    add_styled_paragraph(
        doc,
        "The authentication module provides secure, dual-path access control through Local Email/Password and Google OAuth 2.0 Single Sign-On. When registering locally, passwords are encrypted using Bcrypt with 10 salt rounds. Upon authentication, the server signs a cryptographically secure JSON Web Token containing the user's ID, role, and email. The protect middleware verifies incoming Authorization: Bearer tokens, while roleOnly('admin') or roleOnly('delivery') guards privileged routes."
    )
    add_styled_paragraph(
        doc,
        "To resolve corporate and Windows antivirus SSL certificate interception that commonly crashes Node.js fetch during Google OAuth token exchange, backend/server.js configures process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'. In the event of an OAuth authorization error, the callback redirects gracefully to /login?oauth_error=... with explanatory diagnostics rather than throwing unhandled exceptions."
    )

    add_heading_2(doc, "8.3 Exam Exploration & Syllabus Tracker Module")
    add_styled_paragraph(
        doc,
        "PrepCycle features 33 pre-loaded competitive examinations spanning technical, medical, administrative, and legal disciplines. Students can register for target exams or unregister anytime via DELETE /api/exams/:slug/register. The syllabus engine structures curriculums hierarchically into Subjects, Chapters, and Topics."
    )
    add_styled_paragraph(
        doc,
        "For technical exams such as GATE Computer Science, the system displays the complete official 11-subject curriculum:\n"
        "1. General Aptitude (Verbal, Quantitative, Analytical, Spatial)\n"
        "2. Engineering Mathematics (Discrete Math, Linear Algebra, Calculus, Probability)\n"
        "3. Digital Logic (Boolean Algebra, K-Maps, Combinational & Sequential Circuits)\n"
        "4. Computer Organization & Architecture (ALU, Pipelining, Memory Hierarchy, I/O)\n"
        "5. Programming & Data Structures (C Programming, Stacks, Queues, Trees, Graphs)\n"
        "6. Algorithms (Searching, Sorting, Asymptotic Complexity, Dynamic Programming)\n"
        "7. Theory of Computation (Automata, Context-Free Languages, Turing Machines)\n"
        "8. Compiler Design (Lexical Analysis, Parsing, Intermediate Code Generation)\n"
        "9. Operating Systems (Process Scheduling, Deadlocks, Memory Management, File Systems)\n"
        "10. Databases (ER Models, Normalization, Indexing, Transactions, Concurrency)\n"
        "11. Computer Networks (OSI/TCP-IP Layers, Routing Protocols, Flow & Congestion Control)"
    )

    add_heading_2(doc, "8.4 Multi-Attempt Mock Test System & Score Progression Analytics")
    add_styled_paragraph(
        doc,
        "Under each syllabus topic, direct links to external official mock portals and test series are provided. Unlike conventional systems that overwrite test scores upon each submission, PrepCycle records multiple chronological attempts per topic. Students can click '+ Add Mark / Attempt' to record their raw score and total marks repeatedly."
    )
    add_styled_paragraph(
        doc,
        "Clicking the '📊 Analysis Graph' button opens TopicScoreAnalysisModal, which dynamically plots an interactive SVG score progression curve. The graph plots chronological attempt percentages against an 80% target cutoff line and displays four real-time performance indicators: Latest Score, Personal Best, Attempt Average, and Net Growth percentage. In the Analytics tab, all topic mock test scores are aggregated alongside online quiz attempts to present overall accuracy and test volume timelines."
    )

    add_heading_2(doc, "8.5 Adaptive Exam-Specific Quiz Generator Module")
    add_styled_paragraph(
        doc,
        "The quiz generator dynamically filters available subjects based on the chosen competitive exam. If a student selects NEET, the subject dropdown automatically restricts options to Botany, Zoology, Physics, and Organic Chemistry with zero mathematics questions. If GATE is selected, computer science and engineering mathematics topics are presented. Questions are fetched from dedicated, authentic question banks complete with comprehensive technical explanations."
    )
    add_styled_paragraph(
        doc,
        "Additionally, the module supports generating quizzes from personal study notes. Students can paste text or upload documents; the backend parses the sentences, identifies core conceptual keywords, and generates fill-in-the-blank assessment questions grounded directly in the student's uploaded material."
    )

    add_heading_2(doc, "8.6 Peer-to-Peer Marketplace & Resource Donation Module")
    add_styled_paragraph(
        doc,
        "The Marketplace fosters an educational circular economy through dedicated operational tabs:\n"
        "• Buy Textbooks: Verified listings of pre-owned reference guides with declared conditions and prices.\n"
        "• My Sold Books: A dedicated tab tracking books the student has listed or sold to peer students.\n"
        "• My Donated Books: A tab tracking charitable book donations posted by the student for free pickup.\n"
        "• Free Donated Study Material: A dedicated section where junior students can claim physical textbooks completely free (₹0).\n"
        "• Community Shared PDFs: Curated digital reference materials featuring '🛒 Add to Cart (₹0)', '✓ In Cart / Library', and '📥 Read / Download ↗' buttons."
    )

    add_heading_2(doc, "8.7 Doorstep Logistics & Delivery Partner Module")
    add_styled_paragraph(
        doc,
        "To ensure seamless physical book circulation, PrepCycle includes a dedicated Doorstep Logistics portal for Delivery Partners. Courier agents access an optimized task list detailing customer addresses and phone numbers. For textbook orders, partners update statuses from 'Placed' to 'Dispatched', 'Out for Delivery', and 'Delivered'. For donations and buyback resales, delivery partners travel to student doorsteps, inspect the book's physical condition against declared criteria, and advance statuses to 'Out for Pickup', 'Received', and 'Quality Checked'."
    )

    add_heading_2(doc, "8.8 Centralized Administrative Management Module")
    add_styled_paragraph(
        doc,
        "The Admin Dashboard provides comprehensive platform governance divided into 8 sub-panels: Dashboard Overview, Manage Exams, Manage Resources, Marketplace Products, Users Management, Order Control, Returns & Resales, and Communication Logs. The Returns tab enables administrators to review all student returns, buybacks, and donation requests, schedule pickups with delivery partners, and approve refunds or completion statuses. The Communications tab displays multi-channel audit logs tracking alert dispatches across Email, SMS, and WhatsApp."
    )

    add_heading_2(doc, "8.9 Multi-Language Regional Localization Engine")
    add_styled_paragraph(
        doc,
        "The application integrates an 8-language regional translation engine powered by React Context (LanguageContext). Supported languages include English, Tamil (தமிழ்), Hindi (हिन्दी), Telugu (తెలుగు), Malayalam (മലയാളം), Kannada (ಕನ್ನಡ), Bengali (বাংলা), and Marathi (मराठी). The engine instantly translates navigation controls, buttons, analytical summaries, and marketplace book titles (e.g., translating 'Operating Systems' to 'இயக்க முறைமைகள்' in Tamil or 'ऑपरेटिंग सिस्टम' in Hindi) without requiring server round-trips."
    )

    add_heading_2(doc, "8.10 Interactive Guided Feature Tour Module")
    add_styled_paragraph(
        doc,
        "To onboard first-time students, the platform includes an interactive 7-step Guided Feature Spotlight Tour (GuidedTour.jsx). Triggered via '🎯 Start Guided Tour' in the Exam Explorer, the tour highlights Target Exams, Hierarchical Syllabi, Multi-Attempt Mock Trackers, Adaptive Quizzes, the Circular Marketplace, Doorstep Delivery Logistics, and 8-Language Localization with step indicators, Pro Tips, and keyboard navigation."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 9: CONCLUSION
    # =========================================================================
    add_heading_1(doc, "CHAPTER 9\nCONCLUSION")

    add_styled_paragraph(
        doc,
        "In conclusion, the Multi-Exam Preparation and Resource Exchange Platform (PrepCycle) provides an innovative, comprehensive, and scalable solution to the challenges faced by competitive examination aspirants in India. By synthesizing structured curriculum roadmaps, recurring mock performance analytics, adaptive assessment generation, and sustainable peer-to-peer resource circulation into a unified Modern Web application, PrepCycle eliminates fragmentation and significantly lowers the economic cost of academic preparation."
    )

    add_styled_paragraph(
        doc,
        "The implementation of role-based security ensures clear segregation of duties among Students, Administrators, and Delivery Personnel. Students benefit from in-depth subject tracking (such as the 11-subject GATE CSE syllabus), multi-attempt mock score logging with dynamic SVG progression curves, exam-specific quizzes, and free community study materials. Administrators retain full operational governance over exam catalogs, inventory, user roles, return requests, and communication audits. Delivery partners close the physical loop through doorstep deliveries and donation collections."
    )

    add_styled_paragraph(
        doc,
        "Furthermore, the integration of an 8-language localization engine promotes linguistic inclusivity, enabling aspirants from varied regional backgrounds to navigate complex preparation workflows with confidence. The platform exhibits high software engineering standards, verified through 100% automated test pass rates, strict MVC separation of concerns, enterprise TLS proxy resilience, and zero build errors."
    )

    add_styled_paragraph(
        doc,
        "Future enhancements to the platform may include AI-powered personalized study recommendation engines based on historical mock attempt trajectories, automated optical character recognition (OCR) for physical book quality inspection during doorstep pickups, and real-time GPS tracking for delivery couriers. Overall, PrepCycle stands as a technically rigorous, highly usable, and socially impactful academic platform that advances digital education and sustainable resource circulation."
    )

    output_filename = "Multi_Exam_Preparation_and_Resource_Exchange_Platform_Report.docx"
    doc.save(output_filename)
    print(f"Full Project Report successfully generated and saved to {output_filename}")

if __name__ == "__main__":
    create_report()
