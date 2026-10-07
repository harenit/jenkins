import os
import base64

def get_base64_image(image_path):
    if os.path.exists(image_path):
        with open(image_path, "rb") as img_file:
            return "data:image/png;base64," + base64.b64encode(img_file.read()).decode('utf-8')
    return ""

def generate_html_report():
    class_diag_b64 = get_base64_image("class_diagram.png")
    er_diag_b64 = get_base64_image("er_diagram.png")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>MULTI-EXAM PREPARATION AND RESOURCE EXCHANGE PLATFORM - Project Report</title>
<style>
  @page {{
    size: A4;
    margin: 25mm 20mm 25mm 30mm;
  }}
  @media print {{
    body {{
      font-size: 12pt;
      line-height: 1.5;
    }}
    .page-break {{
      page-break-before: always;
    }}
    .no-print {{
      display: none;
    }}
  }}
  body {{
    font-family: 'Times New Roman', Times, serif;
    color: #000;
    line-height: 1.5;
    margin: 0;
    padding: 30px;
    background: #fff;
    text-align: justify;
  }}
  .report-container {{
    max-width: 850px;
    margin: 0 auto;
  }}
  h1.doc-title {{
    font-size: 18pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin-top: 50px;
    margin-bottom: 20px;
    line-height: 1.3;
  }}
  h2.course-title {{
    font-size: 14pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 40px;
  }}
  .center-text {{
    text-align: center;
  }}
  .bold {{
    font-weight: bold;
  }}
  .italic {{
    font-style: italic;
  }}
  .student-box {{
    display: flex;
    justify-content: space-between;
    width: 60%;
    margin: 20px auto 40px auto;
    font-size: 13pt;
    font-weight: bold;
  }}
  .degree-text {{
    text-align: center;
    font-size: 12pt;
    margin: 40px 0;
    line-height: 1.6;
  }}
  .inst-box {{
    text-align: center;
    margin-top: 80px;
    font-size: 12pt;
    font-weight: bold;
    line-height: 1.5;
  }}
  .inst-box .inst-name {{
    font-size: 14pt;
  }}
  h1.chapter-title {{
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    margin-top: 40px;
    margin-bottom: 25px;
    text-transform: uppercase;
    line-height: 1.3;
  }}
  h2.section-title {{
    font-size: 13pt;
    font-weight: bold;
    margin-top: 25px;
    margin-bottom: 10px;
    text-align: left;
  }}
  h3.subsection-title {{
    font-size: 12pt;
    font-weight: bold;
    font-style: italic;
    color: #1e293b;
    margin-top: 18px;
    margin-bottom: 8px;
  }}
  p {{
    margin-bottom: 14px;
    font-size: 12pt;
    text-indent: 0;
  }}
  ul {{
    margin-top: 6px;
    margin-bottom: 14px;
    padding-left: 24px;
  }}
  li {{
    margin-bottom: 6px;
    font-size: 12pt;
  }}
  .styled-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 10pt;
  }}
  .styled-table th {{
    background-color: #1e3a8a;
    color: #ffffff;
    font-weight: bold;
    padding: 8px 10px;
    border: 1px solid #cbd5e1;
    text-align: left;
  }}
  .styled-table td {{
    padding: 6px 10px;
    border: 1px solid #cbd5e1;
    vertical-align: middle;
  }}
  .styled-table tr:nth-child(even) {{
    background-color: #f8fafc;
  }}
  .img-container {{
    text-align: center;
    margin: 25px 0;
  }}
  .img-container img {{
    max-width: 100%;
    height: auto;
    border: 1px solid #cbd5e1;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }}
  .caption {{
    font-size: 10pt;
    font-weight: bold;
    font-style: italic;
    text-align: center;
    margin-top: 8px;
  }}
  .signature-grid {{
    display: flex;
    justify-content: space-between;
    margin-top: 80px;
    font-weight: bold;
  }}
  .print-btn-bar {{
    position: fixed;
    top: 15px;
    right: 20px;
    background: #1e3a8a;
    color: white;
    padding: 10px 18px;
    border-radius: 6px;
    font-family: sans-serif;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    z-index: 1000;
  }}
  .print-btn-bar:hover {{
    background: #1d4ed8;
  }}
</style>
</head>
<body>

<div class="print-btn-bar no-print" onclick="window.print()">🖨️ Print / Save as PDF</div>

<div class="report-container">

  <!-- COVER PAGE -->
  <div style="min-height: 950px; position: relative;">
    <h1 class="doc-title">MULTI-EXAM PREPARATION AND RESOURCE EXCHANGE PLATFORM</h1>
    <h2 class="course-title">23CS54C – MODERN WEB TECHNOLOGIES</h2>

    <p class="center-text italic bold" style="margin-top: 40px; font-size: 13pt;">Submitted by</p>
    
    <div class="student-box">
      <span>HARENI T</span>
      <span>24104005</span>
    </div>

    <div class="degree-text">
      <span class="italic">In partial fulfillment for the award of the degree<br>of<br></span>
      <span class="bold">BACHELOR OF ENGINEERING<br>in<br>COMPUTER SCIENCE AND ENGINEERING</span>
    </div>

    <div class="inst-box">
      <div class="inst-name">NATIONAL ENGINEERING COLLEGE</div>
      <div>(An Autonomous Institution affiliated to Anna University, Chennai)</div>
      <div>K.R.NAGAR, KOVILPATTI - 628503</div>
      <div style="margin-top: 30px;">OCTOBER - 2026</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- BONAFIDE CERTIFICATE -->
  <div style="min-height: 950px; position: relative;">
    <div class="center-text bold" style="margin-top: 30px; line-height: 1.5;">
      <div style="font-size: 14pt;">NATIONAL ENGINEERING COLLEGE</div>
      <div style="font-size: 11pt;">(An Autonomous Institution affiliated to Anna University, Chennai)</div>
      <div style="font-size: 11pt;">K.R.NAGAR, KOVILPATTI - 628503</div>
    </div>

    <h2 class="center-text bold" style="font-size: 14pt; margin: 45px 0 35px 0; letter-spacing: 1px;">BONAFIDE CERTIFICATE</h2>

    <p style="line-height: 1.8; margin-bottom: 60px;">
      This is to certify that this project report, “<strong>Multi-Exam Preparation and Resource Exchange Platform</strong>”, is the bonafide work of <strong>HARENI T (24104005)</strong> who carried out the project work under my supervision in partial fulfillment of the requirements for the course <strong>23CS54C – MODERN WEB TECHNOLOGIES</strong> during the academic year 2026.
    </p>

    <div style="text-align: right; margin-bottom: 70px;">
      <div style="display: inline-block; text-align: center;">
        <div>_______________________________</div>
        <div class="bold" style="margin-top: 6px;">Course Instructor/Guide</div>
      </div>
    </div>

    <p style="margin-bottom: 60px;">
      Submitted to the <strong>23CS54C – MODERN WEB TECHNOLOGIES</strong> Viva-Voce examination held at National Engineering College, K.R.Nagar, Kovilpatti on ___________________
    </p>

    <div class="signature-grid">
      <div>
        <div>_____________________</div>
        <div style="margin-top: 6px;">Internal Examiner</div>
      </div>
      <div style="text-align: right;">
        <div>_____________________</div>
        <div style="margin-top: 6px;">Co Examiner</div>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- TABLE OF CONTENTS -->
  <div>
    <h1 class="chapter-title">TABLE OF CONTENTS</h1>
    <table class="styled-table">
      <thead>
        <tr>
          <th style="width: 12%; text-align: center;">CH NO</th>
          <th style="width: 76%;">TITLE</th>
          <th style="width: 12%; text-align: center;">PAGE NO</th>
        </tr>
      </thead>
      <tbody>
        <tr><td style="text-align: center; font-weight: bold;">1</td><td class="bold">INTRODUCTION</td><td style="text-align: center;">3</td></tr>
        <tr><td style="text-align: center; font-weight: bold;">2</td><td class="bold">OBJECTIVES</td><td style="text-align: center;">5</td></tr>
        <tr><td style="text-align: center; font-weight: bold;">3</td><td class="bold">DESCRIPTION</td><td style="text-align: center;">6</td></tr>
        <tr><td style="text-align: center; font-weight: bold;">4</td><td class="bold">CLASS DIAGRAM</td><td style="text-align: center;">8</td></tr>
        <tr><td style="text-align: center; font-weight: bold;">5</td><td class="bold">TABLE STRUCTURES / DATA SCHEMAS</td><td style="text-align: center;">10</td></tr>
        <tr><td style="text-align: center; font-weight: bold;">6</td><td class="bold">ER DIAGRAM</td><td style="text-align: center;">16</td></tr>
        <tr><td style="text-align: center; font-weight: bold;">7</td><td class="bold">TECH STACK</td><td style="text-align: center;">18</td></tr>
        <tr><td style="text-align: center; font-weight: bold;">8</td><td class="bold">MODULES</td><td style="text-align: center;">20</td></tr>
        <tr><td></td><td style="padding-left: 20px;">8.1 Folder Structure & Architecture</td><td style="text-align: center;">20</td></tr>
        <tr><td></td><td style="padding-left: 20px;">8.2 Authentication & Multi-Role Security</td><td style="text-align: center;">23</td></tr>
        <tr><td></td><td style="padding-left: 20px;">8.3 Exam Exploration & Syllabus Tracker</td><td style="text-align: center;">25</td></tr>
        <tr><td></td><td style="padding-left: 20px;">8.4 Multi-Attempt Mock Test System & Analytics</td><td style="text-align: center;">28</td></tr>
        <tr><td></td><td style="padding-left: 20px;">8.5 Adaptive Dynamic Quiz Generator</td><td style="text-align: center;">31</td></tr>
        <tr><td></td><td style="padding-left: 20px;">8.6 Peer-to-Peer Marketplace & Resource Donation</td><td style="text-align: center;">33</td></tr>
        <tr><td></td><td style="padding-left: 20px;">8.7 Doorstep Logistics & Order Delivery Tracking</td><td style="text-align: center;">35</td></tr>
        <tr><td></td><td style="padding-left: 20px;">8.8 Centralized Administrative Management</td><td style="text-align: center;">37</td></tr>
        <tr><td></td><td style="padding-left: 20px;">8.9 Multi-Language Localization Engine</td><td style="text-align: center;">39</td></tr>
        <tr><td></td><td style="padding-left: 20px;">8.10 Interactive Guided Feature Tour</td><td style="text-align: center;">41</td></tr>
        <tr><td style="text-align: center; font-weight: bold;">9</td><td class="bold">CONCLUSION</td><td style="text-align: center;">42</td></tr>
      </tbody>
    </table>
  </div>

  <div class="page-break"></div>

  <!-- CHAPTER 1 -->
  <h1 class="chapter-title">CHAPTER 1<br>INTRODUCTION</h1>
  <p>The Multi-Exam Preparation and Resource Exchange Platform (PrepCycle) is an end-to-end, enterprise-grade web application engineered to address the critical fragmentation, high financial barrier, and resource disparity faced by millions of competitive exam aspirants across India. Competitive examinations in engineering (GATE, JEE), medical sciences (NEET), management (CAT, XAT), civil services (UPSC, TNPSC), and public sectors (SSC, Banking, RRB) demand highly structured subject tracking, recurring mock assessments, domain-specific continuous evaluation, and access to expensive preparation materials.</p>
  <p>Traditional exam preparation workflows rely on scattered web portals, disparate PDF repositories, physical commercial bookstores, and isolated offline practice notes. Students routinely purchase costly reference textbooks that become obsolete or redundant once an examination cycle concludes, creating severe educational waste and economic strain. Simultaneously, junior aspirants and economically challenged students struggle to acquire quality textbooks and curated notes. Existing educational software architectures predominantly cater to generic institutional attendance or rigid single-course management, failing to unify syllabus tracking, continuous testing, peer-to-peer resource circulation, and localized accessibility into a cohesive digital ecosystem.</p>
  <p>PrepCycle bridges these systemic challenges by delivering an integrated Modern Web platform structured around three distinct, role-authenticated user classes: Student, Administrator, and Doorstep Delivery Partner. For students, the platform provides real-time enrollment across 33 premier competitive exams, comprehensive multi-tier syllabus tracking (including full 11-subject breakdowns for technical streams like GATE Computer Science), sub-topic mock test integration with multi-attempt scoring and SVG progression analytics, and an adaptive quiz generation engine capable of filtering subjects dynamically per target exam discipline.</p>
  <p>In addition to rigorous academic tracking, PrepCycle pioneers a closed-loop Circular Economy Marketplace for study materials. Students can purchase pre-owned verified textbooks, list excess reference guides for resale, or donate physical books completely free of charge to junior aspirants. To eliminate logistical friction, the platform incorporates an end-to-end Doorstep Logistics sub-system where dedicated delivery personnel manage scheduled order deliveries, quality-verify return items, and collect donated textbooks directly from student doorsteps.</p>
  <p>Furthermore, to democratize access across diverse linguistic demographics, PrepCycle features an interactive 8-language regional translation engine (covering English, Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, and Marathi) that dynamically localizes UI controls, navigation menus, and catalog titles. Supported by secure JWT session tokens, Google OAuth 2.0 single sign-on with corporate SSL proxy bypass, automated multi-channel communication logging, and an interactive Guided Spotlight Tour, PrepCycle establishes an extensible, highly responsive, and data-driven benchmark for modern educational web platforms.</p>

  <div class="page-break"></div>

  <!-- CHAPTER 2 -->
  <h1 class="chapter-title">CHAPTER 2<br>OBJECTIVES</h1>
  <p>The primary objective of this project is to develop, architect, and deploy a secure, responsive, and data-driven web application that unifies multi-exam academic preparation, automated performance analytics, circular resource exchange, and doorstep fulfillment. The specific technical objectives include:</p>
  <ul>
    <li><strong>Role-Based Authentication and Access Control:</strong> To engineer a secure multi-role authorization framework utilizing JSON Web Tokens (JWT) and Google OAuth 2.0, providing distinct capabilities for Students, Administrators, and Delivery Partners while enforcing strict route protection.</li>
    <li><strong>Centralized NoSQL Database Management:</strong> To design and maintain a scalable MongoDB Atlas database schema modeling users, competitive exams, multi-tiered syllabi, progress states, mock test attempts, commerce orders, donation pickups, and communication audit trails.</li>
    <li><strong>Multi-Exam Syllabus & Roadmap Tracking:</strong> To establish comprehensive syllabus tracking for 33 national and state competitive exams, featuring in-depth 11-subject hierarchical mapping for GATE CSE with real-time percentage completion calculations.</li>
    <li><strong>Multi-Attempt Mock Scoring & Progression Analytics:</strong> To allow students to record repeated mock test scores per sub-topic without overwriting history, dynamically calculating metrics such as Latest Score, Personal Best, Attempt Average, and Net Growth percentage, visualized through interactive SVG trajectory curves and 80% benchmark cutoff lines.</li>
    <li><strong>Adaptive Exam-Specific Quiz Generation:</strong> To engineer an intelligent quiz generator that dynamically filters subjects based on the chosen exam alongside uploaded notes parsing for automated question synthesis.</li>
    <li><strong>Peer-to-Peer Marketplace & Book Circulation:</strong> To facilitate a sustainable educational resource exchange where students can buy used textbooks at affordable prices, list items for buyback resale, or donate physical resources entirely free of cost to peer aspirants.</li>
    <li><strong>Digital Community Study PDF Acquisition:</strong> To provide direct "Add to Cart (₹0)" and immediate "Read / Download" mechanisms for student-shared open PDF materials directly within the digital marketplace.</li>
    <li><strong>Doorstep Logistics & Real-Time Order Tracking:</strong> To create a specialized operational interface for Delivery Partners to manage doorstep order fulfillment, verify item physical condition during return/resale pickups, and update multi-stage status workflows in real time.</li>
    <li><strong>Centralized Administrative Control:</strong> To provide administrators with an intuitive multi-tab management dashboard to oversee platform metrics, curate exams and study resources, manage user roles, resolve return/resale/donation pickup requests, and audit communication dispatches.</li>
    <li><strong>8-Language Regional Localization Engine:</strong> To deliver comprehensive accessibility across India through real-time client-side translation of navigation controls, analytical headings, and marketplace book titles into Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, and Marathi.</li>
    <li><strong>Interactive Step-by-Step Guided Feature Tour:</strong> To incorporate an interactive onboarding tour that guides first-time users through target exams, syllabus roadmaps, multi-attempt score analysis, adaptive quizzes, marketplace features, and delivery tracking.</li>
    <li><strong>Enterprise Reliability & Fault Tolerance:</strong> To implement global error handling shields, database connection retry logic, and TLS certificate inspection bypasses to ensure seamless execution across diverse institutional and operating system environments.</li>
  </ul>

  <div class="page-break"></div>

  <!-- CHAPTER 3 -->
  <h1 class="chapter-title">CHAPTER 3<br>DESCRIPTION</h1>
  <p>The Multi-Exam Preparation and Resource Exchange Platform is architected as a high-performance Single-Page Application (SPA) backed by a decoupled RESTful API server. The system establishes clear operational boundaries and distinct workflows for each of its three primary stakeholders: Students, Administrators, and Delivery Partners.</p>
  
  <h2 class="section-title">3.1 Student Workflow and Ecosystem</h2>
  <p>Upon registration or Google Single Sign-On, a student is assigned a unique alphanumeric Student ID (e.g., STU-2026-9481). Students enter the Exam Explorer where they can browse 33 premier competitive exams categorized into Engineering, Medical, Civil Services, Management, Law, and Banking. Students can register for target exams with a single click, instantly initializing their customized syllabus tracker, or unregister from exams they no longer wish to pursue.</p>
  <p>Within the Progress Hub, students interact with a deeply structured syllabus hierarchy. For instance, in GATE Computer Science, the student navigates through 11 core subjects divided into weightage-ranked chapters and discrete topics. Each topic integrates direct mock test portal links. Students can record multiple test attempts over time, capturing their score, maximum marks, and timestamp. The system evaluates their historical progression, dynamically rendering an SVG score trajectory curve against an 80% cutoff line alongside growth indicators.</p>
  <p>In the Quiz Generator, students select their registered exam to load domain-appropriate subjects automatically. A student preparing for NEET receives biology, zoology, physics, and organic chemistry questions with zero mathematical contamination, whereas a GATE student receives questions on paging, deadlocks, and asymptotic complexity. Alternatively, students can upload textual study notes, which the system parses using heuristic sentence-blanking algorithms to synthesize tailored practice questions.</p>

  <h2 class="section-title">3.2 Administrator Workflow and Operational Oversight</h2>
  <p>The Administrator Dashboard serves as the central operational hub for platform monitoring and governance. Accessible only to authenticated users with the 'admin' role, the dashboard provides high-level system metrics including total registered students, active exams, marketplace inventory value, and order volumes. Administrators can create, update, or remove exam syllabi, curate official PDF resources, manage marketplace listings, and adjust user privileges dynamically.</p>
  <p>A critical feature of the admin module is the Returns / Resale / Donations Management tab. Here, administrators inspect student requests for textbook buybacks, returns, and charitable donations. Administrators review pickup addresses, contact information, declared book condition, and expected values, assigning requests to delivery partners or advancing statuses from 'Requested' to 'Approved', 'Pickup Scheduled', 'Quality Checked', and 'Completed'. Administrators also monitor multi-channel notification logs across Email, SMS, and WhatsApp dispatch channels.</p>

  <h2 class="section-title">3.3 Delivery Partner Workflow and Doorstep Logistics</h2>
  <p>The Delivery Partner portal is tailored specifically for field courier personnel. Delivery partners log into a mobile-responsive interface showing their active assigned tasks across two operational categories: Customer Order Deliveries and Doorstep Return/Donation Pickups. Partners view recipient addresses, telephone numbers, and item details. During pickups, partners inspect book physical condition, record notes, and update statuses to 'Out for Pickup', 'Received', and 'Quality Checked', closing the loop between digital requests and physical asset circulation.</p>

  <div class="page-break"></div>

  <!-- CHAPTER 4 -->
  <h1 class="chapter-title">CHAPTER 4<br>CLASS DIAGRAM</h1>
  <p>The class diagram models the object-oriented structure of the PrepCycle platform, representing domain entities, their attributes, visibility specifiers, methods, and relationships. The architecture employs inheritance for role specialization and associations for academic progress, assessment tracking, and commerce fulfillment.</p>
  
  <div class="img-container">
    <img src="{class_diag_b64}" alt="Class Diagram">
    <div class="caption">Fig 4.1 – Class Diagram – Object-Oriented Architecture of the PrepCycle Platform.</div>
  </div>

  <h2 class="section-title">4.1 Description of Core Classes and Relationships</h2>
  <p><strong>1. User (Base Model):</strong> Serves as the central identity class containing core credentials, contact details, authentication provider (local/Google OAuth), and role identifiers. It maintains references to enrolled exams and bookmarked resources, providing foundational authentication and session validation methods.</p>
  <p><strong>2. Student & DeliveryPartner (Specialized Roles):</strong> Student encapsulates academic attributes such as target graduation year, study streaks, and mock scores. DeliveryPartner manages logistical fields including vehicle details, assigned delivery zones, active shipment orders, and scheduled pickup tasks.</p>
  <p><strong>3. Exam, Subject, Chapter, and Topic:</strong> Forms the academic knowledge tree. Exam defines conducting authorities, application dates, and official URLs. Subject and Chapter organize the learning curriculum, while Topic encapsulates discrete learning outcomes, completion states, and external mock assessment URLs.</p>
  <p><strong>4. Progress & MockAttempt:</strong> Progress tracks topic-level pending/completed states and study calendar days for each student. MockAttempt maintains a chronological log of mock test submissions, storing raw marks, maximum scores, percentages, and timestamps to power progression curve analytics.</p>
  <p><strong>5. Product, Order, and ReturnRequest:</strong> Governs the circular economy marketplace. Product models textbook listings, conditions (New, Good, Fair), and donation flags. Order manages customer purchases, payment states, and delivery milestones. ReturnRequest models reverse logistics for buybacks, returns, and free book donations.</p>

  <div class="page-break"></div>

  <!-- CHAPTER 5 -->
  <h1 class="chapter-title">CHAPTER 5<br>TABLE STRUCTURES / DATA SCHEMAS</h1>
  <p>PrepCycle utilizes MongoDB Atlas, a distributed document-oriented database. The application enforces rigorous data validation, typing, indexing, and referential constraints through Mongoose schemas. The schema specifications for the primary collections are presented below:</p>

  <h2 class="section-title">5.1 Users Collection (users)</h2>
  <table class="styled-table">
    <thead><tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><strong>_id</strong></td><td>ObjectId</td><td>NO</td><td style="color: #b45309; font-weight: bold;">PRI</td><td>auto_generated</td><td>Unique internal MongoDB document identifier</td></tr>
      <tr><td><strong>studentId</strong></td><td>String</td><td>NO</td><td style="color: #b45309; font-weight: bold;">UNI</td><td>STU-YYYY-XXXX</td><td>Formatted institutional student identification code</td></tr>
      <tr><td><strong>name</strong></td><td>String</td><td>NO</td><td>MUL</td><td>None</td><td>Full legal name of the user</td></tr>
      <tr><td><strong>email</strong></td><td>String</td><td>NO</td><td style="color: #b45309; font-weight: bold;">UNI</td><td>None</td><td>Primary email address used for login and notifications</td></tr>
      <tr><td><strong>password</strong></td><td>String</td><td>YES</td><td>None</td><td>None</td><td>Bcrypt hashed password (null for OAuth users)</td></tr>
      <tr><td><strong>role</strong></td><td>Enum</td><td>NO</td><td>MUL</td><td>'student'</td><td>Access role: 'student', 'admin', 'delivery'</td></tr>
      <tr><td><strong>authProvider</strong></td><td>String</td><td>NO</td><td>None</td><td>'local'</td><td>Identity provider: 'local' or 'google'</td></tr>
      <tr><td><strong>registeredExams</strong></td><td>Array&lt;String&gt;</td><td>YES</td><td>None</td><td>[]</td><td>List of exam slugs the student is actively pursuing</td></tr>
      <tr><td><strong>createdAt</strong></td><td>DateTime</td><td>NO</td><td>None</td><td>CURRENT_TIMESTAMP</td><td>Timestamp of initial account registration</td></tr>
    </tbody>
  </table>

  <h2 class="section-title">5.2 Exams Collection (exams)</h2>
  <table class="styled-table">
    <thead><tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><strong>_id</strong></td><td>ObjectId</td><td>NO</td><td style="color: #b45309; font-weight: bold;">PRI</td><td>auto_generated</td><td>Unique document identifier</td></tr>
      <tr><td><strong>slug</strong></td><td>String</td><td>NO</td><td style="color: #b45309; font-weight: bold;">UNI</td><td>None</td><td>URL-friendly unique identifier (e.g., 'gate-cse', 'cat')</td></tr>
      <tr><td><strong>name</strong></td><td>String</td><td>NO</td><td>MUL</td><td>None</td><td>Official examination title (e.g., 'GATE CSE')</td></tr>
      <tr><td><strong>category</strong></td><td>String</td><td>NO</td><td>MUL</td><td>None</td><td>Category: 'engineering', 'medical', 'management'</td></tr>
      <tr><td><strong>authority</strong></td><td>String</td><td>NO</td><td>None</td><td>None</td><td>Conducting government body or institute</td></tr>
      <tr><td><strong>officialUrl</strong></td><td>String</td><td>NO</td><td>None</td><td>None</td><td>Official conducting authority portal web link</td></tr>
      <tr><td><strong>subjects</strong></td><td>Array&lt;SubDoc&gt;</td><td>NO</td><td>None</td><td>[]</td><td>Nested array of subjects, chapters, and topics</td></tr>
    </tbody>
  </table>

  <h2 class="section-title">5.3 Mock Attempts Collection (mockattempts)</h2>
  <table class="styled-table">
    <thead><tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><strong>_id</strong></td><td>ObjectId</td><td>NO</td><td style="color: #b45309; font-weight: bold;">PRI</td><td>auto_generated</td><td>Unique attempt identifier</td></tr>
      <tr><td><strong>user</strong></td><td>ObjectId</td><td>NO</td><td>FK</td><td>None</td><td>Foreign key reference to users collection</td></tr>
      <tr><td><strong>examSlug</strong></td><td>String</td><td>NO</td><td>FK</td><td>None</td><td>Associated exam identifier</td></tr>
      <tr><td><strong>topicId</strong></td><td>String</td><td>NO</td><td>MUL</td><td>None</td><td>Target syllabus topic identifier</td></tr>
      <tr><td><strong>score</strong></td><td>Number</td><td>NO</td><td>None</td><td>None</td><td>Marks obtained by student in this attempt</td></tr>
      <tr><td><strong>maxScore</strong></td><td>Number</td><td>NO</td><td>None</td><td>100</td><td>Maximum possible marks for the assessment</td></tr>
      <tr><td><strong>percentage</strong></td><td>Float</td><td>NO</td><td>None</td><td>0.0</td><td>Computed percentage score ((score/maxScore)*100)</td></tr>
      <tr><td><strong>createdAt</strong></td><td>DateTime</td><td>NO</td><td>None</td><td>CURRENT_TIMESTAMP</td><td>Assessment completion timestamp</td></tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- CHAPTER 6 -->
  <h1 class="chapter-title">CHAPTER 6<br>ENTITY-RELATIONSHIP (ER) DIAGRAM</h1>
  <p>The Entity-Relationship (ER) diagram visualizes the conceptual database schema of PrepCycle, showing entity sets, primary and foreign key attributes, and relational cardinalities across user operations, academic tracking, and commerce circulation.</p>
  
  <div class="img-container">
    <img src="{er_diag_b64}" alt="ER Diagram">
    <div class="caption">Fig 6.1 – Entity-Relationship (ER) Diagram – Relational Topology of PrepCycle.</div>
  </div>

  <h2 class="section-title">6.1 Relational Cardinality Analysis</h2>
  <p><strong>1. USER and EXAM (M:N via 'Registers'):</strong> A student can register for multiple competitive exams, while each competitive exam accommodates thousands of enrolled students.</p>
  <p><strong>2. USER and PROGRESS (1:N):</strong> For every exam enrolled, a user possesses exactly one dedicated progress record that maintains the status of all topics in that exam's syllabus.</p>
  <p><strong>3. USER and MOCK_ATTEMPT (1:N):</strong> A student can execute and record numerous mock tests across different topics and dates to generate progression curves.</p>
  <p><strong>4. USER and PRODUCT (1:N via 'Lists/Sells'):</strong> A student can list several textbooks for resale or free donation in the marketplace.</p>
  <p><strong>5. USER and ORDER (1:N via 'Places'):</strong> A student can place multiple orders over time, each containing one or more product items fulfilled by an assigned delivery partner.</p>

  <div class="page-break"></div>

  <!-- CHAPTER 7 -->
  <h1 class="chapter-title">CHAPTER 7<br>TECH STACK</h1>
  <p>PrepCycle is implemented using the industry-standard MERN technology stack, augmented with Vite for build optimization, JSON Web Tokens for authentication, and Google OAuth 2.0:</p>
  <ul>
    <li><strong>Frontend Technologies:</strong> React.js (v18), Vite v5, Modern Modular CSS, Context API.</li>
    <li><strong>Backend Technologies:</strong> Node.js (v22 LTS), Express.js (v4), RESTful API Architecture.</li>
    <li><strong>Database:</strong> MongoDB Atlas cloud database managed via Mongoose ODM (v8).</li>
    <li><strong>Authentication:</strong> JSON Web Tokens (JWT), Bcrypt.js password hashing, Google OAuth 2.0 Single Sign-On.</li>
    <li><strong>Security:</strong> Sliding-window Rate Limiting (180 req/min), CORS protection, HTTP headers sanitization.</li>
    <li><strong>Internationalization:</strong> React Context API with comprehensive 8-language regional dictionaries.</li>
    <li><strong>Data Visualization:</strong> Native responsive SVG progression curves and cutoff benchmark lines.</li>
  </ul>

  <h2 class="section-title">7.1 Architecture: MVC (Model-View-Controller)</h2>
  <ul>
    <li><strong>Models:</strong> Mongoose schemas in <code>backend/models/</code> defining data structures, business rules, and validation logic.</li>
    <li><strong>Views:</strong> React components in <code>frontend/src/pages/</code> and <code>frontend/src/components/</code> rendering dynamic user interfaces.</li>
    <li><strong>Controllers:</strong> Express route handlers in <code>backend/controllers/</code> managing business logic and API responses.</li>
  </ul>

  <div class="page-break"></div>

  <!-- CHAPTER 8 -->
  <h1 class="chapter-title">CHAPTER 8<br>MODULES</h1>
  
  <h2 class="section-title">8.1 Folder Structure & Architecture</h2>
  <p>The application is cleanly divided into a decoupled backend API server and frontend React client:</p>
  <p><strong>Backend Architecture:</strong><br>
  <code>backend/server.js</code> – Central entrypoint mounting routes, database seeds, and error shields.<br>
  <code>backend/controllers/</code> – Modular request handlers for auth, exams, progress, quizzes, commerce, admin, and communications.<br>
  <code>backend/routes/</code> – RESTful endpoint declarations.<br>
  <code>backend/models/</code> – Mongoose schema models.<br>
  <code>backend/middleware/</code> – Token verification and role gating.<br>
  <code>backend/data/</code> – Seed catalog for 33 exams, seed users, and products.</p>

  <p><strong>Frontend Architecture:</strong><br>
  <code>frontend/src/pages/</code> – Full page views (ExamExplorer, MyProgress, Marketplace, Orders, AdminDashboard, DeliveryDashboard).<br>
  <code>frontend/src/components/</code> – Reusable components (TopicScoreAnalysisModal, QuizGenerator, GuidedTour, OwlMascot).<br>
  <code>frontend/src/context/</code> – AuthContext and LanguageContext for dynamic localization.</p>

  <h2 class="section-title">8.2 Detailed Platform Modules</h2>
  <p><strong>1. Authentication & Multi-Role Security:</strong> Dual login through local credentials and Google OAuth 2.0 with Windows TLS certificate bypass. Role-based routing enforces student, admin, and delivery separation.</p>
  <p><strong>2. Exam Exploration & Syllabus Tracker:</strong> 33 competitive exams with real-time registration/unregistration. Detailed 11-subject syllabus breakdown for GATE CSE with topic status toggles.</p>
  <p><strong>3. Multi-Attempt Mock Test System:</strong> Direct external mock test links under each syllabus topic. Students log repeated marks; the system renders an interactive SVG score progression curve with an 80% target cutoff line and personal best indicators.</p>
  <p><strong>4. Adaptive Exam-Specific Quiz Generator:</strong> Dynamically filters subjects based on target exam (e.g. NEET presents Biology without math; GATE presents computer science). Supports generating quizzes from uploaded student notes.</p>
  <p><strong>5. Peer-to-Peer Marketplace & Book Circulation:</strong> Tabs for buying textbooks, tracking sold books, managing book donations, claiming free donated study materials (₹0), and acquiring community shared PDFs.</p>
  <p><strong>6. Doorstep Logistics & Delivery Partner System:</strong> Couriers manage delivery orders and doorstep donation/return pickups, inspecting physical book quality and advancing statuses in real time.</p>
  <p><strong>7. Centralized Administrative Management:</strong> Multi-tab dashboard governing platform metrics, exam catalogs, marketplace inventory, user privileges, returns/resales, and multi-channel communication logs.</p>
  <p><strong>8. 8-Language Regional Localization:</strong> Full client-side translation across English, Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, and Marathi for all navigation, controls, and book titles.</p>
  <p><strong>9. Interactive Guided Feature Tour:</strong> A 7-step onboarding spotlight tour highlighting platform capabilities with step dots, pro tips, and keyboard controls.</p>

  <div class="page-break"></div>

  <!-- CHAPTER 9 -->
  <h1 class="chapter-title">CHAPTER 9<br>CONCLUSION</h1>
  <p>In conclusion, the Multi-Exam Preparation and Resource Exchange Platform (PrepCycle) provides an innovative, comprehensive, and scalable solution to the challenges faced by competitive examination aspirants in India. By synthesizing structured curriculum roadmaps, recurring mock performance analytics, adaptive assessment generation, and sustainable peer-to-peer resource circulation into a unified Modern Web application, PrepCycle eliminates fragmentation and significantly lowers the economic cost of academic preparation.</p>
  <p>The implementation of role-based security ensures clear segregation of duties among Students, Administrators, and Delivery Personnel. Students benefit from in-depth subject tracking (such as the 11-subject GATE CSE syllabus), multi-attempt mock score logging with dynamic SVG progression curves, exam-specific quizzes, and free community study materials. Administrators retain full operational governance over exam catalogs, inventory, user roles, return requests, and communication audits. Delivery partners close the physical loop through doorstep deliveries and donation collections.</p>
  <p>Furthermore, the integration of an 8-language localization engine promotes linguistic inclusivity, enabling aspirants from varied regional backgrounds to navigate complex preparation workflows with confidence. The platform exhibits high software engineering standards, verified through 100% automated test pass rates, strict MVC separation of concerns, enterprise TLS proxy resilience, and zero build errors.</p>
  <p>Future enhancements to the platform may include AI-powered personalized study recommendation engines based on historical mock attempt trajectories, automated optical character recognition (OCR) for physical book quality inspection during doorstep pickups, and real-time GPS tracking for delivery couriers. Overall, PrepCycle stands as a technically rigorous, highly usable, and socially impactful academic platform that advances digital education and sustainable resource circulation.</p>

</div>

</body>
</html>"""

    output_path = "PROJECT_REPORT.html"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"HTML Report successfully generated and saved to {output_path}")

if __name__ == "__main__":
    generate_html_report()
