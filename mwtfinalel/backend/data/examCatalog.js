// Generates the exam catalog with subject-accurate roadmap content.
// Current-cycle dates are linked to the official authority portal rather than
// inventing dates that can change after publication.

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function topic(name) {
  return { name };
}

function chapter(name, weightage, topics) {
  return {
    name,
    weightage,
    topics: topics.map(topic),
    mockTests: [],
  };
}

function subject(name, chapters) {
  return { name, chapters };
}

// Assigns stable ids after the exam slug is known.
function withIds(examSlug, subjects) {
  return subjects.map((sub, si) => {
    const subjectId = `${examSlug}__s${si}`;
    return {
      id: subjectId,
      name: sub.name,
      chapters: sub.chapters.map((ch, ci) => {
        const chapterId = `${subjectId}__c${ci}`;
        return {
          id: chapterId,
          name: ch.name,
          weightage: ch.weightage,
          topics: ch.topics.map((t, ti) => ({
            id: `${chapterId}__t${ti}`,
            name: t.name,
          })),
          mockTests: [
            { id: `${chapterId}__quiz1`, name: `${ch.name} Practice Quiz 1`, url: `/my-progress?exam=${examSlug}&chapter=${chapterId}&quiz=1` },
            { id: `${chapterId}__quiz2`, name: `${ch.name} Practice Quiz 2`, url: `/my-progress?exam=${examSlug}&chapter=${chapterId}&quiz=2` },
            { id: `${chapterId}__quiz3`, name: `${ch.name} Practice Quiz 3`, url: `/my-progress?exam=${examSlug}&chapter=${chapterId}&quiz=3` },
          ],
        };
      }),
    };
  });
}

const commonTimeline = (overrides = {}) => ({
  notification: "Current notification is published on the official examination authority portal linked below.",
  registrationStart: "The application schedule is published on the official examination authority portal linked below.",
  registrationEnd: "The application schedule is published on the official examination authority portal linked below.",
  correction: "The correction window is announced in the official examination notice when applicable.",
  admitCard: "Admit-card release is announced by the examination authority through its official portal.",
  examDate: "The current examination schedule is published by the examination authority on its official portal.",
  answerKey: "The authority publishes the answer key after the examination when applicable.",
  result: "The authority publishes the result after evaluation through the official portal.",
  ...overrides,
});

const standardApplicationProcedure = [
  "Open the official examination authority portal and read the current notification/information bulletin.",
  "Confirm the current eligibility, age, qualification, category and attempt requirements for the specific exam.",
  "Create or use the required candidate account on the official application portal.",
  "Enter the requested personal, academic and category information exactly as supported by your official documents.",
  "Upload only the documents and image files specified in the current notification, using the prescribed format and size.",
  "Pay the applicable examination fee through the payment methods listed by the authority, if a fee applies.",
  "Submit the application, save the confirmation/application number, and monitor the official portal for correction, admit-card, examination and result notices.",
];

const standardDressCode = [
  "There is no single dress rule shared by every examination; follow the candidate instructions in the current admit card and official authority notice.",
  "Carry only the identification documents and permitted items listed in the current examination-day instructions.",
];

// ---- Roadmap builders per broad category (reused across similar exams) ----

function scienceRoadmap() {
  return [
    subject("Physics", [
      chapter("Mechanics", "High", ["Kinematics", "Laws of Motion", "Work, Energy and Power", "Rotational Motion", "Gravitation"]),
      chapter("Thermodynamics", "Medium", ["Kinetic Theory of Gases", "Laws of Thermodynamics", "Heat Transfer"]),
      chapter("Electrodynamics", "High", ["Electrostatics", "Current Electricity", "Magnetic Effects of Current", "Electromagnetic Induction"]),
      chapter("Optics", "Medium", ["Ray Optics", "Wave Optics"]),
      chapter("Modern Physics", "Medium", ["Dual Nature of Matter", "Atoms and Nuclei", "Semiconductor Electronics"]),
    ]),
    subject("Chemistry", [
      chapter("Physical Chemistry", "High", ["Mole Concept", "States of Matter", "Chemical Equilibrium", "Electrochemistry", "Chemical Kinetics"]),
      chapter("Inorganic Chemistry", "Medium", ["Periodic Table", "Chemical Bonding", "Coordination Compounds", "p-Block Elements"]),
      chapter("Organic Chemistry", "High", ["Basic Concepts", "Hydrocarbons", "Alcohols and Ethers", "Aldehydes and Ketones", "Biomolecules"]),
    ]),
    subject("Biology", [
      chapter("Diversity of Living Organisms", "Medium", ["Classification", "Plant Kingdom", "Animal Kingdom"]),
      chapter("Human Physiology", "High", ["Digestion and Absorption", "Breathing and Exchange of Gases", "Circulation", "Excretion", "Neural Control"]),
      chapter("Genetics and Evolution", "High", ["Principles of Inheritance", "Molecular Basis of Inheritance", "Evolution"]),
      chapter("Ecology", "Low", ["Organisms and Populations", "Ecosystem", "Biodiversity and Conservation"]),
    ]),
  ];
}

function mathEngineeringRoadmap() {
  return [
    subject("Physics", [
      chapter("Mechanics", "High", ["Kinematics", "Newton's Laws", "Work-Energy Theorem", "Rotational Dynamics"]),
      chapter("Electromagnetism", "High", ["Electrostatics", "Current Electricity", "Magnetism"]),
      chapter("Modern Physics", "Medium", ["Photoelectric Effect", "Atomic Structure", "Nuclear Physics"]),
    ]),
    subject("Chemistry", [
      chapter("Physical Chemistry", "High", ["Mole Concept", "Thermodynamics", "Equilibrium", "Electrochemistry"]),
      chapter("Organic Chemistry", "High", ["GOC", "Hydrocarbons", "Named Reactions"]),
      chapter("Inorganic Chemistry", "Medium", ["Periodicity", "Chemical Bonding", "Coordination Chemistry"]),
    ]),
    subject("Mathematics", [
      chapter("Algebra", "High", ["Quadratic Equations", "Sequences and Series", "Complex Numbers", "Matrices and Determinants"]),
      chapter("Calculus", "High", ["Limits and Continuity", "Differentiation", "Integration", "Differential Equations"]),
      chapter("Coordinate Geometry", "Medium", ["Straight Lines", "Circles", "Conic Sections"]),
      chapter("Trigonometry", "Medium", ["Trigonometric Ratios", "Trigonometric Equations"]),
    ]),
  ];
}

function generalCompetitiveRoadmap() {
  return [
    subject("Quantitative Aptitude", [
      chapter("Arithmetic", "High", ["Percentages", "Profit and Loss", "Simple and Compound Interest", "Ratio and Proportion"]),
      chapter("Algebra", "Medium", ["Linear Equations", "Quadratic Equations"]),
      chapter("Data Interpretation", "High", ["Tables", "Bar and Line Graphs", "Pie Charts"]),
      chapter("Geometry and Mensuration", "Medium", ["Lines and Angles", "Triangles", "Area and Volume"]),
    ]),
    subject("Reasoning", [
      chapter("Verbal Reasoning", "High", ["Analogy", "Coding-Decoding", "Blood Relations", "Syllogism"]),
      chapter("Non-Verbal Reasoning", "Medium", ["Series", "Mirror and Water Images", "Puzzles"]),
    ]),
    subject("English Language", [
      chapter("Grammar", "High", ["Tenses", "Subject-Verb Agreement", "Error Spotting"]),
      chapter("Vocabulary", "Medium", ["Synonyms and Antonyms", "One-Word Substitution", "Idioms and Phrases"]),
      chapter("Comprehension", "Medium", ["Reading Comprehension", "Cloze Test"]),
    ]),
    subject("General Awareness", [
      chapter("Current Affairs", "High", ["National Events", "International Events", "Awards and Honours"]),
      chapter("Static GK", "Medium", ["Indian History", "Geography", "Polity", "Economy"]),
    ]),
  ];
}

function upscStyleRoadmap() {
  return [
    subject("General Studies", [
      chapter("History and Culture", "High", ["Ancient India", "Medieval India", "Modern India", "Indian Art and Culture"]),
      chapter("Geography", "High", ["Physical Geography", "Indian Geography", "World Geography"]),
      chapter("Polity and Governance", "High", ["Constitutional Framework", "Union and State Government", "Local Government"]),
      chapter("Economy", "High", ["Basic Concepts", "Fiscal and Monetary Policy", "Economic Reforms"]),
      chapter("Environment and Ecology", "Medium", ["Biodiversity", "Climate Change", "Environmental Policies"]),
      chapter("Science and Technology", "Medium", ["Space Technology", "IT and Communication", "Biotechnology"]),
    ]),
    subject("CSAT", [
      chapter("Comprehension", "Medium", ["Reading Comprehension Passages"]),
      chapter("Reasoning and Aptitude", "Medium", ["Logical Reasoning", "Basic Numeracy", "Data Interpretation"]),
    ]),
    subject("Essay and Ethics", [
      chapter("Ethics, Integrity and Aptitude", "Medium", ["Foundational Values", "Attitude and Emotional Intelligence", "Case Studies"]),
    ]),
  ];
}

function managementRoadmap() {
  return [
    subject("Quantitative Aptitude", [
      chapter("Arithmetic", "High", ["Percentages", "Ratios", "Averages", "Time Speed Distance"]),
      chapter("Algebra and Geometry", "Medium", ["Equations", "Geometry Basics", "Mensuration"]),
    ]),
    subject("Verbal Ability", [
      chapter("Reading Comprehension", "High", ["Passage-based Questions"]),
      chapter("Verbal Reasoning", "Medium", ["Para Jumbles", "Critical Reasoning"]),
    ]),
    subject("Data Interpretation and Logical Reasoning", [
      chapter("Data Interpretation", "High", ["Tables and Caselets", "Graphs and Charts"]),
      chapter("Logical Reasoning", "High", ["Arrangements", "Puzzles", "Games and Tournaments"]),
    ]),
  ];
}

function lawRoadmap() {
  return [
    subject("Legal Reasoning", [
      chapter("Legal Principles", "High", ["Constitutional Law Basics", "Contract Law Basics", "Tort Law Basics"]),
      chapter("Legal Aptitude", "High", ["Legal Maxims", "Application-based Questions"]),
    ]),
    subject("English Language", [
      chapter("Comprehension", "High", ["Reading Comprehension"]),
      chapter("Grammar and Vocabulary", "Medium", ["Grammar Rules", "Vocabulary Building"]),
    ]),
    subject("General Knowledge", [
      chapter("Current Affairs", "High", ["National and International Affairs"]),
      chapter("Static GK", "Medium", ["History", "Geography", "Polity"]),
    ]),
    subject("Logical Reasoning", [
      chapter("Reasoning", "Medium", ["Analogy", "Syllogism", "Logical Sequences"]),
    ]),
  ];
}

function teachingRoadmap() {
  return [
    subject("Child Development and Pedagogy", [
      chapter("Child Development", "High", ["Growth and Development", "Learning Theories", "Individual Differences"]),
      chapter("Pedagogy", "High", ["Teaching Methods", "Inclusive Education", "Assessment and Evaluation"]),
    ]),
    subject("Language Proficiency", [
      chapter("Language I", "Medium", ["Comprehension", "Grammar", "Pedagogy of Language"]),
      chapter("Language II", "Medium", ["Comprehension", "Grammar", "Pedagogy of Language"]),
    ]),
    subject("Content and Methodology", [
      chapter("Subject Content", "High", ["Core Concepts as per syllabus"]),
      chapter("Teaching Methodology", "Medium", ["Subject-specific Pedagogy"]),
    ]),
  ];
}

function financeCommerceRoadmap() {
  return [
    subject("Accounting", [
      chapter("Fundamentals of Accounting", "High", ["Accounting Principles", "Journal and Ledger", "Trial Balance"]),
      chapter("Financial Statements", "High", ["Final Accounts", "Depreciation", "Rectification of Errors"]),
    ]),
    subject("Law", [
      chapter("Business Laws", "Medium", ["Contract Act Basics", "Sale of Goods Act"]),
    ]),
    subject("Economics", [
      chapter("Microeconomics", "Medium", ["Demand and Supply", "Market Structures"]),
      chapter("Macroeconomics", "Medium", ["National Income", "Money and Banking"]),
    ]),
    subject("Quantitative Aptitude", [
      chapter("Business Mathematics", "Medium", ["Ratios and Proportions", "Time Value of Money", "Statistics Basics"]),
    ]),
  ];
}

function designRoadmap() {
  return [
    subject("Design Aptitude", [
      chapter("Visual Perception", "High", ["Colour Theory", "Form and Composition", "Visual Communication"]),
      chapter("Creative Thinking", "High", ["Sketching", "Design Process", "Problem Solving"]),
    ]),
    subject("General Knowledge and Awareness", [
      chapter("Design Awareness", "Medium", ["Contemporary Design Trends", "Materials and Processes"]),
    ]),
    subject("Mathematics and Analytical Ability", [
      chapter("Analytical Reasoning", "Medium", ["Pattern Recognition", "Spatial Reasoning"]),
    ]),
  ];
}

function gateCseRoadmap() {
  return [
    subject("General Aptitude", [
      chapter("Verbal Aptitude", "High", [
        "Basic English Grammar and Sentence Structure",
        "Vocabulary, Synonyms and Antonyms in Context",
        "Reading Comprehension and Critical Reasoning",
        "Narrative Sequencing and Text Completion",
      ]),
      chapter("Quantitative Aptitude", "High", [
        "Data Interpretation (Tables, Graphs, Pie Charts)",
        "Numerical Computation and Estimation",
        "Elementary Statistics and Probability",
        "Ratios, Percentages and Profit-Loss",
        "Speed-Time-Distance and Work-Time",
      ]),
      chapter("Analytical & Spatial Aptitude", "Medium", [
        "Logic Deductions, Syllogisms and Induction",
        "Analogy and Numerical Reasoning",
        "Pattern Folding and 2D/3D Spatial Rotations",
        "Paper Folding and Grouping of Figures",
      ]),
    ]),
    subject("Engineering Mathematics", [
      chapter("Discrete Mathematics", "High", [
        "Propositional and First-Order Logic",
        "Sets, Relations, Equivalence and Partial Orders",
        "Groups, Monoids and Lattice Theory",
        "Combinatorics, Counting and Generating Functions",
        "Graph Theory (Paths, Cycles, Coloring, Matching)",
      ]),
      chapter("Linear Algebra", "High", [
        "Matrices, Determinants and Matrix Operations",
        "Systems of Linear Equations and Consistency",
        "Eigenvalues, Eigenvectors and Diagonalization",
        "LU Decomposition and Vector Spaces",
      ]),
      chapter("Calculus", "Medium", [
        "Limits, Continuity and Differentiability",
        "Maxima and Minima of Functions",
        "Mean Value Theorems (Rolle's & Lagrange's)",
        "Definite and Improper Integrals",
      ]),
      chapter("Probability and Statistics", "High", [
        "Conditional Probability and Bayes Theorem",
        "Discrete and Continuous Random Variables",
        "Probability Distributions (Binomial, Poisson, Normal)",
        "Mean, Median, Mode and Standard Deviation",
      ]),
    ]),
    subject("Digital Logic", [
      chapter("Boolean Algebra and Minimization", "High", [
        "Boolean Functions and Canonical Representations",
        "K-Map Minimization (Up to 5 Variables)",
        "Logic Gates and NAND/NOR Universal Realizations",
      ]),
      chapter("Combinational Circuits", "High", [
        "Multiplexers and Demultiplexers",
        "Decoders, Encoders and Priority Encoders",
        "Half and Full Adders / Subtractors",
        "Magnitude Comparators and Code Converters",
      ]),
      chapter("Sequential Circuits", "High", [
        "Latches and Flip-Flops (SR, JK, D, T)",
        "Synchronous and Asynchronous Counters",
        "Shift Registers and Ring/Johnson Counters",
        "Finite State Machines (Mealy and Moore Models)",
      ]),
      chapter("Number Representation and Computer Arithmetic", "Medium", [
        "Fixed and Floating Point Representations (IEEE 754)",
        "Signed Magnitude, 1's and 2's Complement",
        "Overflow Detection and Ripple Carry Addition",
      ]),
    ]),
    subject("Computer Organization and Architecture (COA)", [
      chapter("Machine Instructions and Addressing", "High", [
        "Instruction Formats and Opcode Encoding",
        "Addressing Modes (Direct, Indirect, Indexed, Relative)",
        "ALU, Data-Path and Control Unit Design",
        "Instruction Cycle and Register Transfer Notation",
      ]),
      chapter("Instruction Pipelining", "High", [
        "Pipeline Stages, Clock Cycles, CPI and Speedup",
        "Structural, Data (RAW, WAR, WAW) and Control Hazards",
        "Branch Prediction, Delayed Branching and Forwarding",
      ]),
      chapter("Memory Hierarchy", "High", [
        "Cache Memory Mapping (Direct, Fully Associative, Set-Associative)",
        "Cache Hit/Miss Rates and Multi-Level Cache Performance",
        "Cache Replacement Policies and Write Policies",
        "Virtual Memory, Paging, Segmentation and TLB",
        "Main Memory Architecture and DRAM Refresh",
      ]),
      chapter("I/O Organization", "Medium", [
        "Programmed I/O and Interrupt-Driven I/O",
        "Direct Memory Access (DMA Cycle Stealing & Burst)",
        "Bus Arbitration and Standard System Buses",
      ]),
    ]),
    subject("Programming and Data Structures", [
      chapter("Programming in C", "High", [
        "Variables, Data Types, Storage Classes and Scope",
        "Recursion, Call Stack and Parameter Passing",
        "Pointers, Pointer Arithmetic and Dynamic Memory Allocation",
        "Structures, Unions and Bit Fields",
      ]),
      chapter("Linear Data Structures", "High", [
        "Arrays and Multidimensional Row/Column Major Mapping",
        "Stacks: Evaluation of Expressions and Infix/Postfix",
        "Queues: FIFO, Circular Queues and Deques",
        "Singly Linked Lists, Doubly Linked Lists and Circular Lists",
      ]),
      chapter("Trees and Binary Search Trees", "High", [
        "Binary Tree Properties and Pointer Representations",
        "Tree Traversals (Inorder, Preorder, Postorder, Level-Order)",
        "Binary Search Trees: Search, Insertion, Deletion",
        "AVL Trees, Rotations and Balanced Search Trees",
        "Binary Heaps, Min/Max Heapify and Priority Queues",
      ]),
      chapter("Graphs and Hashing", "High", [
        "Graph Representations (Adjacency Matrix and Adjacency List)",
        "Hash Tables, Hash Functions and Collision Resolution",
      ]),
    ]),
    subject("Algorithms", [
      chapter("Asymptotic Analysis and Recurrences", "High", [
        "Asymptotic Notations (Big-O, Omega, Theta)",
        "Recurrence Relations and Master Theorem",
        "Worst-Case, Average-Case and Amortized Time Complexity",
      ]),
      chapter("Divide and Conquer & Greedy Techniques", "High", [
        "Merge Sort, Quick Sort and Binary Search Analysis",
        "Greedy Strategy: Activity Selection Problem",
        "Fractional Knapsack and Optimal Merge Patterns",
        "Huffman Coding and Prefix Codes",
      ]),
      chapter("Dynamic Programming", "High", [
        "Optimal Substructure and Overlapping Subproblems",
        "0/1 Knapsack Problem and Subset Sum",
        "Longest Common Subsequence (LCS)",
        "Matrix Chain Multiplication",
        "Floyd-Warshall All-Pairs Shortest Path",
      ]),
      chapter("Graph Algorithms", "High", [
        "Breadth-First Search (BFS) and Depth-First Search (DFS)",
        "Minimum Spanning Trees (Prim's and Kruskal's)",
        "Single-Source Shortest Paths (Dijkstra's and Bellman-Ford)",
        "Topological Sorting and Directed Acyclic Graphs (DAGs)",
      ]),
    ]),
    subject("Theory of Computation (TOC)", [
      chapter("Regular Languages and Finite Automata", "High", [
        "Deterministic Finite Automata (DFA) and NFA",
        "NFA to DFA Conversion and Regular Expressions",
        "Pumping Lemma for Regular Languages",
        "DFA State Minimization and Myhill-Nerode Theorem",
        "Closure and Decidable Properties of Regular Languages",
      ]),
      chapter("Context-Free Languages and Pushdown Automata", "High", [
        "Context-Free Grammars (CFG) and Parse Trees",
        "Ambiguity in CFGs and Language Ambiguity",
        "Pushdown Automata (DPDA vs NPDA)",
        "Pumping Lemma for CFLs and Closure Properties",
        "Chomsky Normal Form (CNF)",
      ]),
      chapter("Turing Machines and Undecidability", "High", [
        "Turing Machine Models and Transitions",
        "Recursive vs Recursively Enumerable Languages",
        "The Halting Problem and Reducibility",
        "Post Correspondence Problem and Rice's Theorem",
        "Chomsky Hierarchy of Formal Languages",
      ]),
    ]),
    subject("Compiler Design", [
      chapter("Lexical Analysis and Parsing", "High", [
        "Tokens, Patterns, Lexemes and Lexical Analyzers",
        "Top-Down Parsing: LL(1) Grammars, FIRST and FOLLOW Sets",
        "Bottom-Up Parsing: Shift-Reduce, LR(0), SLR(1), LALR(1), CLR(1)",
        "Operator Precedence Parsing",
      ]),
      chapter("Syntax-Directed Translation and Type Checking", "Medium", [
        "Syntax-Directed Definitions: Synthesized vs Inherited Attributes",
        "Syntax-Directed Translation Schemes (SDT)",
        "Type Checking and Symbol Table Design",
      ]),
      chapter("Intermediate Code Generation and Optimization", "Medium", [
        "Three-Address Code, Quadruples and Syntax Trees",
        "Basic Blocks, Control Flow Graphs and Dominators",
        "Code Optimization (Common Subexpressions, Loop Optimization)",
        "Data-Flow Analysis: Reaching Definitions and Liveness",
        "Runtime Storage Organization and Activation Records",
      ]),
    ]),
    subject("Operating Systems (OS)", [
      chapter("Processes, Threads and CPU Scheduling", "High", [
        "Process Concept, PCB, States and Context Switching",
        "User vs Kernel Threads and Multi-threading Models",
        "CPU Scheduling: FCFS, SJF, SRTF, Round Robin, Priority",
        "Multi-Level Feedback Queue Scheduling and Metrics",
      ]),
      chapter("Concurrency and Synchronization", "High", [
        "Race Conditions and Critical Section Problem",
        "Peterson's Algorithm and Hardware Synchronization",
        "Semaphores, Binary Semaphores and Mutexes",
        "Classical Synchronization: Producer-Consumer, Reader-Writer, Dining Philosophers",
        "Monitors and Condition Variables",
      ]),
      chapter("Deadlocks", "High", [
        "Deadlock Conditions (Mutual Exclusion, Hold & Wait, No Preemption, Circular)",
        "Resource Allocation Graphs (RAG)",
        "Deadlock Prevention and Deadlock Avoidance (Banker's Algorithm)",
        "Deadlock Detection Algorithms and Recovery Techniques",
      ]),
      chapter("Memory Management and Virtual Memory", "High", [
        "Contiguous Memory Allocation and Fragmentation",
        "Paging, Page Tables, Hierarchical Paging and Inverted Tables",
        "Segmentation and Combined Segmented Paging",
        "Virtual Memory: Demand Paging and Page Fault Handling",
        "Page Replacement Algorithms: FIFO, LRU, Optimal and Belady's Anomaly",
        "Thrashing, Working Set Model and Page Fault Frequency",
      ]),
      chapter("Storage, File Systems and I/O", "Medium", [
        "File Organization, Directory Structures and Protection",
        "File Allocation Methods (Contiguous, Linked, Indexed)",
        "Free Space Management (Bit Vectors, Linked Lists)",
        "Disk Scheduling Algorithms: FCFS, SSTF, SCAN, C-SCAN, LOOK",
      ]),
    ]),
    subject("Databases (DBMS)", [
      chapter("Database Design and Relational Model", "High", [
        "Entity-Relationship (ER) Modeling and Constraints",
        "Relational Model Concepts and Integrity Constraints",
        "Relational Algebra: Select, Project, Join, Division",
        "Tuple Relational Calculus and Domain Relational Calculus",
      ]),
      chapter("SQL and Database Queries", "High", [
        "SQL DDL, DML and DCL Syntax",
        "Aggregate Functions, GROUP BY, HAVING and ORDER BY",
        "Nested Queries, Correlated Subqueries and Set Operations",
        "Joins: Inner, Left Outer, Right Outer and Full Outer Joins",
        "Views, Assertions and Triggers",
      ]),
      chapter("Relational Database Design and Normalization", "High", [
        "Functional Dependencies, Closure and Candidate Keys",
        "Canonical Cover and Minimal Covers",
        "Lossless Decomposition and Dependency Preservation",
        "Normal Forms: 1NF, 2NF, 3NF and Boyce-Codd Normal Form (BCNF)",
        "Multi-Valued Dependencies and Fourth Normal Form (4NF)",
      ]),
      chapter("Transactions and Concurrency Control", "High", [
        "ACID Properties and Transaction Lifecycle States",
        "Schedules: Serial, Conflict Serializability and View Serializability",
        "Testing Serializability using Precedence Graphs",
        "Recoverability, Cascadeless Schedules and Cascading Rollbacks",
        "Concurrency Control: Two-Phase Locking (2PL, Strict 2PL)",
        "Timestamp Ordering Protocol and Thomas Write Rule",
      ]),
      chapter("File Organization and Indexing", "Medium", [
        "File Organization: Heap, Sorted and Hash Files",
        "Indexing: Primary, Clustering, Secondary and Dense vs Sparse Indexes",
        "B-Trees: Structure, Search, Insertion and Node Splitting",
        "B+ Trees: Leaf Linking, Range Queries and Height Calculations",
      ]),
    ]),
    subject("Computer Networks (CN)", [
      chapter("Layering Concepts and Physical Layer", "Medium", [
        "OSI 7-Layer Reference Model vs TCP/IP Protocol Architecture",
        "Packet Switching vs Circuit Switching vs Virtual Circuits",
        "Transmission Media, Bandwidth, Latency and Throughput",
        "Data Rate Limits: Nyquist Bit Rate and Shannon Channel Capacity",
      ]),
      chapter("Data Link Layer and MAC Sublayer", "High", [
        "Framing Methods (Character Count, Bit Stuffing, Byte Stuffing)",
        "Error Detection and Correction: Parity, Checksum, CRC",
        "Flow Control Protocols: Stop-and-Wait, Go-Back-N, Selective Repeat",
        "Medium Access Control: Pure ALOHA, Slotted ALOHA, CSMA/CD, CSMA/CA",
        "Ethernet Frame Format (IEEE 802.3) and MAC Addresses",
        "Bridges, Switches, Collision Domains and Broadcast Domains",
      ]),
      chapter("Network Layer and Routing", "High", [
        "IPv4 Addressing, Subnet Masks and CIDR Supernetting",
        "IPv4 Datagram Format, Header Fields and Fragmentation",
        "IPv6 Addressing, Format and Migration",
        "Routing Algorithms: Distance Vector and Link State (Dijkstra)",
        "Routing Protocols: RIP, OSPF and BGP",
        "Support Protocols: ARP, RARP, ICMP, DHCP and NAT",
      ]),
      chapter("Transport Layer", "High", [
        "Transport Layer Services, Port Numbers and Sockets",
        "UDP (User Datagram Protocol): Datagram Format and Mechanics",
        "TCP: Connection Setup (3-Way Handshake) and Termination",
        "TCP Flow Control: Sliding Window Mechanism",
        "TCP Congestion Control: AIMD, Slow Start, Fast Retransmit & Recovery",
      ]),
      chapter("Application Layer and Network Security", "Medium", [
        "Domain Name System (DNS) Resolution Process",
        "HTTP 1.1, HTTP/2, HTTPS and SSL/TLS Handshake",
        "Electronic Mail Architecture: SMTP, POP3, IMAP and MIME",
        "File Transfer Protocol (FTP)",
        "Network Security: Symmetric/Asymmetric Ciphers, RSA, Digital Signatures, Firewalls",
      ]),
    ]),
  ];
}

// ---- Exam catalog definitions ----
// Official authority portals are stored so students can verify current-cycle
// dates, notices, applications and results directly with the authority.

const RAW_EXAMS = [
  { name: "NEET UG", authority: "National Testing Agency (NTA)", category: "science",
    description: "National-level entrance exam for admission to MBBS/BDS courses across India.",
    eligibility: "10+2 with Physics, Chemistry, Biology; minimum qualifying marks vary by category.",
    officialUrl: "https://neet.nta.nic.in",     pattern: { subjectsCovered: ["Physics", "Chemistry", "Biology"], sections: ["Physics", "Chemistry", "Botany", "Zoology"], questionType: "MCQ", duration: "3 hours 20 minutes", marking: "+4 correct, -1 incorrect", mode: "Pen and paper (OMR)" },
    roadmap: scienceRoadmap() },

  { name: "JEE Main", authority: "National Testing Agency (NTA)", category: "engineering",
    description: "National-level entrance exam for admission to NITs, IIITs, and other engineering colleges; also a screening exam for JEE Advanced.",
    eligibility: "10+2 with Physics, Mathematics, and Chemistry/Biotechnology.",
    officialUrl: "https://jeemain.nta.nic.in",     pattern: { subjectsCovered: ["Physics", "Chemistry", "Mathematics"], sections: ["Physics", "Chemistry", "Mathematics"], questionType: "MCQ + Numerical", duration: "3 hours", marking: "+4 correct, -1 incorrect (MCQ)", mode: "Computer-based test" },
    roadmap: mathEngineeringRoadmap() },

  { name: "JEE Advanced", authority: "IIT (rotating zone)", category: "engineering",
    description: "Entrance exam for admission to the IITs, taken by top-ranking JEE Main qualifiers.",
    eligibility: "Must rank within the top qualifiers of JEE Main; limited number of attempts.",
    officialUrl: "https://jeeadv.ac.in",     pattern: { subjectsCovered: ["Physics", "Chemistry", "Mathematics"], sections: ["Paper 1", "Paper 2"], questionType: "Mixed (MCQ, numerical, matching)", duration: "3 hours per paper", marking: "Varies by question type", mode: "Computer-based test" },
    roadmap: mathEngineeringRoadmap() },

  { name: "CUET UG", authority: "National Testing Agency (NTA)", category: "general",
    description: "Common university entrance test for undergraduate admission to central and participating universities.",
    eligibility: "10+2 from a recognized board.",
    officialUrl: "https://cuet.nta.nic.in",     pattern: { subjectsCovered: ["Language", "Domain Subjects", "General Test"], sections: ["Section IA/IB", "Section II", "Section III"], questionType: "MCQ", duration: "Varies by number of subjects chosen", marking: "+5 correct, -1 incorrect", mode: "Computer-based test" },
    roadmap: generalCompetitiveRoadmap() },

  { name: "UPSC Civil Services", authority: "Union Public Service Commission (UPSC)", category: "civil-services",
    description: "India's premier civil services exam for recruitment to IAS, IPS, IFS and other central services.",
    eligibility: "Bachelor's degree from a recognized university; age limits and attempts vary by category.",
    officialUrl: "https://upsc.gov.in",     pattern: { subjectsCovered: ["General Studies", "CSAT", "Optional Subject (Mains)"], sections: ["Prelims", "Mains", "Interview"], questionType: "MCQ (Prelims), Descriptive (Mains)", duration: "2 hours per paper (Prelims)", marking: "+2 correct, -0.66 incorrect (Prelims)", mode: "Pen and paper" },
    roadmap: upscStyleRoadmap() },

  { name: "SSC CGL", authority: "Staff Selection Commission (SSC)", category: "general",
    description: "Combined Graduate Level exam for recruitment to Group B and C posts in central government ministries.",
    eligibility: "Bachelor's degree from a recognized university.",
    officialUrl: "https://ssc.gov.in",     pattern: { subjectsCovered: ["Quant", "Reasoning", "English", "General Awareness"], sections: ["Tier I", "Tier II"], questionType: "MCQ", duration: "1 hour per tier", marking: "+2 correct, -0.5 incorrect", mode: "Computer-based test" },
    roadmap: generalCompetitiveRoadmap() },

  { name: "SSC CHSL", authority: "Staff Selection Commission (SSC)", category: "general",
    description: "Combined Higher Secondary Level exam for Group C posts like LDC, JSA, and DEO.",
    eligibility: "10+2 from a recognized board.",
    officialUrl: "https://ssc.gov.in",     pattern: { subjectsCovered: ["Quant", "Reasoning", "English", "General Awareness"], sections: ["Tier I", "Tier II", "Tier III"], questionType: "MCQ + Typing/Skill test", duration: "1 hour (Tier I)", marking: "+2 correct, -0.5 incorrect", mode: "Computer-based test" },
    roadmap: generalCompetitiveRoadmap() },

  { name: "SSC MTS", authority: "Staff Selection Commission (SSC)", category: "general",
    description: "Multi-Tasking Staff exam for Group C non-technical posts across central government offices.",
    eligibility: "10th pass from a recognized board.",
    officialUrl: "https://ssc.gov.in",     pattern: { subjectsCovered: ["Numerical Aptitude", "Reasoning", "General Awareness", "English"], sections: ["Session 1", "Session 2"], questionType: "MCQ", duration: "45 minutes per session", marking: "+1 correct, -0.25 incorrect", mode: "Computer-based test" },
    roadmap: generalCompetitiveRoadmap() },

  { name: "IBPS PO", authority: "Institute of Banking Personnel Selection (IBPS)", category: "banking",
    description: "Recruitment exam for Probationary Officers in public sector banks (excluding SBI).",
    eligibility: "Bachelor's degree from a recognized university.",
    officialUrl: "https://ibps.in",     pattern: { subjectsCovered: ["Reasoning", "Quant", "English", "General Awareness", "Computer Aptitude"], sections: ["Prelims", "Mains", "Interview"], questionType: "MCQ", duration: "1 hour (Prelims)", marking: "+1 correct, -0.25 incorrect", mode: "Computer-based test" },
    roadmap: generalCompetitiveRoadmap() },

  { name: "IBPS Clerk", authority: "Institute of Banking Personnel Selection (IBPS)", category: "banking",
    description: "Recruitment exam for Clerical cadre in public sector banks.",
    eligibility: "Bachelor's degree from a recognized university.",
    officialUrl: "https://ibps.in",     pattern: { subjectsCovered: ["Reasoning", "Quant", "English", "General Awareness"], sections: ["Prelims", "Mains"], questionType: "MCQ", duration: "1 hour (Prelims)", marking: "+1 correct, -0.25 incorrect", mode: "Computer-based test" },
    roadmap: generalCompetitiveRoadmap() },

  { name: "SBI PO", authority: "State Bank of India (SBI)", category: "banking",
    description: "Recruitment exam for Probationary Officers at State Bank of India.",
    eligibility: "Bachelor's degree from a recognized university.",
    officialUrl: "https://sbi.co.in/careers",     pattern: { subjectsCovered: ["Reasoning", "Quant", "English", "Data Analysis"], sections: ["Prelims", "Mains", "Interview/GD"], questionType: "MCQ", duration: "1 hour (Prelims)", marking: "+1 correct, -0.25 incorrect", mode: "Computer-based test" },
    roadmap: generalCompetitiveRoadmap() },

  { name: "SBI Clerk", authority: "State Bank of India (SBI)", category: "banking",
    description: "Recruitment exam for Junior Associate (Clerical) roles at State Bank of India.",
    eligibility: "Bachelor's degree from a recognized university.",
    officialUrl: "https://sbi.co.in/careers",     pattern: { subjectsCovered: ["Reasoning", "Quant", "English"], sections: ["Prelims", "Mains"], questionType: "MCQ", duration: "1 hour (Prelims)", marking: "+1 correct, -0.25 incorrect", mode: "Computer-based test" },
    roadmap: generalCompetitiveRoadmap() },

  { name: "RRB NTPC", authority: "Railway Recruitment Board (RRB)", category: "railways",
    description: "Non-Technical Popular Categories exam for various graduate and undergraduate posts in Indian Railways.",
    eligibility: "10+2 or Bachelor's degree, depending on the post applied for.",
    officialUrl: "https://indianrailways.gov.in",     pattern: { subjectsCovered: ["General Awareness", "Mathematics", "Reasoning"], sections: ["CBT 1", "CBT 2"], questionType: "MCQ", duration: "90 minutes (CBT 1)", marking: "+1 correct, -1/3 incorrect", mode: "Computer-based test" },
    roadmap: generalCompetitiveRoadmap() },

  { name: "RRB Group D", authority: "Railway Recruitment Board (RRB)", category: "railways",
    description: "Recruitment exam for Level 1 posts (Track Maintainer, Helper, etc.) in Indian Railways.",
    eligibility: "10th pass or ITI from a recognized board/institute.",
    officialUrl: "https://indianrailways.gov.in",     pattern: { subjectsCovered: ["Mathematics", "Reasoning", "General Science", "General Awareness"], sections: ["CBT", "PET"], questionType: "MCQ", duration: "90 minutes", marking: "+1 correct, -1/3 incorrect", mode: "Computer-based test" },
    roadmap: generalCompetitiveRoadmap() },

  { name: "GATE CSE", authority: "IIT (rotating zone)", category: "engineering-pg",
    description: "Graduate Aptitude Test in Engineering for Computer Science - gateway to M.Tech admissions and PSU recruitment.",
    eligibility: "Bachelor's degree in Engineering/Technology/relevant science.",
    officialUrl: "https://gate2026.iitg.ac.in",     pattern: { subjectsCovered: ["General Aptitude", "Engineering Mathematics", "Digital Logic", "COA", "Programming & Data Structures", "Algorithms", "Theory of Computation", "Compiler Design", "Operating Systems", "DBMS", "Computer Networks"], sections: ["Single paper"], questionType: "MCQ + Numerical Answer Type", duration: "3 hours", marking: "Varies (partial negative marking on MCQs)", mode: "Computer-based test" },
    roadmap: gateCseRoadmap() },

  { name: "CAT", authority: "Indian Institutes of Management (IIM)", category: "management",
    description: "Common Admission Test for admission to IIMs and other top management institutes.",
    eligibility: "Bachelor's degree with minimum required percentage.",
    officialUrl: "https://iimcat.ac.in",     pattern: { subjectsCovered: ["VARC", "DILR", "Quant"], sections: ["VARC", "DILR", "Quant"], questionType: "MCQ + TITA", duration: "2 hours", marking: "+3 correct, -1 incorrect (MCQ)", mode: "Computer-based test" },
    roadmap: managementRoadmap() },

  { name: "XAT", authority: "XLRI Jamshedpur", category: "management",
    description: "Xavier Aptitude Test for admission to XLRI and other associated management institutes.",
    eligibility: "Bachelor's degree in any discipline.",
    officialUrl: "https://xatonline.in",     pattern: { subjectsCovered: ["Verbal Ability", "Decision Making", "Quant", "General Knowledge"], sections: ["Part 1", "Part 2"], questionType: "MCQ", duration: "3 hours", marking: "+1 correct, -0.25 incorrect", mode: "Computer-based test" },
    roadmap: managementRoadmap() },

  { name: "MAT", authority: "All India Management Association (AIMA)", category: "management",
    description: "Management Aptitude Test accepted by numerous B-schools across India.",
    eligibility: "Bachelor's degree in any discipline.",
    officialUrl: "https://mat.aima.in",     pattern: { subjectsCovered: ["Language Comprehension", "Quant", "Data Analysis", "Reasoning", "GK"], sections: ["5 sections"], questionType: "MCQ", duration: "2 hours 30 minutes", marking: "+1 correct, -0.25 incorrect", mode: "CBT / Paper / Remote" },
    roadmap: managementRoadmap() },

  { name: "CLAT", authority: "Consortium of National Law Universities", category: "law",
    description: "Common Law Admission Test for undergraduate and postgraduate programs at National Law Universities.",
    eligibility: "10+2 with minimum required percentage.",
    officialUrl: "https://consortiumofnlus.ac.in",     pattern: { subjectsCovered: ["English", "GK", "Legal Reasoning", "Logical Reasoning", "Quant"], sections: ["Single paper"], questionType: "MCQ", duration: "2 hours", marking: "+1 correct, -0.25 incorrect", mode: "Computer-based test" },
    roadmap: lawRoadmap() },

  { name: "AILET", authority: "National Law University, Delhi", category: "law",
    description: "All India Law Entrance Test for admission to NLU Delhi's programs.",
    eligibility: "10+2 with minimum required percentage.",
    officialUrl: "https://nludelhi.ac.in",     pattern: { subjectsCovered: ["English", "GK", "Legal Aptitude", "Reasoning", "Quant"], sections: ["Single paper"], questionType: "MCQ", duration: "90 minutes", marking: "+1 correct, -0.25 incorrect", mode: "Pen and paper" },
    roadmap: lawRoadmap() },

  { name: "NDA", authority: "Union Public Service Commission (UPSC)", category: "defence",
    description: "National Defence Academy exam for entry into the Army, Navy, and Air Force wings.",
    eligibility: "10+2 (specific stream requirements for Air Force/Navy); unmarried; age limits apply.",
    officialUrl: "https://upsc.gov.in",     pattern: { subjectsCovered: ["Mathematics", "General Ability Test"], sections: ["Maths", "GAT"], questionType: "MCQ", duration: "2.5 hours per paper", marking: "Negative marking applies", mode: "Pen and paper" },
    roadmap: mathEngineeringRoadmap() },

  { name: "CDS", authority: "Union Public Service Commission (UPSC)", category: "defence",
    description: "Combined Defence Services exam for entry into IMA, INA, AFA, and OTA.",
    eligibility: "Bachelor's degree; specific requirements vary by academy.",
    officialUrl: "https://upsc.gov.in",     pattern: { subjectsCovered: ["English", "General Knowledge", "Elementary Mathematics"], sections: ["3 papers"], questionType: "MCQ", duration: "2 hours per paper", marking: "Negative marking applies", mode: "Pen and paper" },
    roadmap: generalCompetitiveRoadmap() },

  { name: "UGC NET", authority: "University Grants Commission (UGC) / NTA", category: "teaching",
    description: "National Eligibility Test for Assistant Professor and JRF eligibility across Indian universities.",
    eligibility: "Master's degree with minimum required percentage.",
    officialUrl: "https://ugcnet.nta.nic.in",     pattern: { subjectsCovered: ["Teaching/Research Aptitude", "Subject Paper"], sections: ["Paper I", "Paper II"], questionType: "MCQ", duration: "3 hours (combined)", marking: "+2 correct, no negative marking", mode: "Computer-based test" },
    roadmap: teachingRoadmap() },

  { name: "CTET", authority: "Central Board of Secondary Education (CBSE)", category: "teaching",
    description: "Central Teacher Eligibility Test for teaching positions in central government schools.",
    eligibility: "Varies by paper (I: primary teachers, II: upper primary teachers); minimum qualification per CTET norms.",
    officialUrl: "https://ctet.nic.in",     pattern: { subjectsCovered: ["Child Development and Pedagogy", "Languages", "Content Subjects"], sections: ["Paper I", "Paper II"], questionType: "MCQ", duration: "2.5 hours per paper", marking: "+1 correct, no negative marking", mode: "Computer-based test" },
    roadmap: teachingRoadmap() },

  { name: "TNPSC Group 1", authority: "Tamil Nadu Public Service Commission (TNPSC)", category: "state-civil-services",
    description: "Recruitment exam for top administrative posts in the Tamil Nadu state government.",
    eligibility: "Bachelor's degree from a recognized university.",
    officialUrl: "https://tnpsc.gov.in",     pattern: { subjectsCovered: ["General Studies", "Aptitude and Mental Ability"], sections: ["Prelims", "Mains", "Interview"], questionType: "MCQ (Prelims), Descriptive (Mains)", duration: "3 hours (Prelims)", marking: "Negative marking applies", mode: "Pen and paper" },
    roadmap: upscStyleRoadmap() },

  { name: "TNPSC Group 2", authority: "Tamil Nadu Public Service Commission (TNPSC)", category: "state-civil-services",
    description: "Recruitment exam for Group 2 (Non-Interview and Interview) posts in Tamil Nadu government departments.",
    eligibility: "Bachelor's degree from a recognized university.",
    officialUrl: "https://tnpsc.gov.in",     pattern: { subjectsCovered: ["General Studies", "Aptitude"], sections: ["Single paper"], questionType: "MCQ", duration: "3 hours", marking: "Negative marking applies", mode: "Pen and paper" },
    roadmap: generalCompetitiveRoadmap() },

  { name: "TNPSC Group 4", authority: "Tamil Nadu Public Service Commission (TNPSC)", category: "state-civil-services",
    description: "Recruitment exam for Group 4 posts (Junior Assistant, Typist, etc.) in Tamil Nadu government departments.",
    eligibility: "10+2 from a recognized board.",
    officialUrl: "https://tnpsc.gov.in",     pattern: { subjectsCovered: ["General Tamil/English", "General Studies", "Aptitude"], sections: ["Single paper"], questionType: "MCQ", duration: "3 hours", marking: "Negative marking applies", mode: "Pen and paper" },
    roadmap: generalCompetitiveRoadmap() },

  { name: "CA Foundation", authority: "Institute of Chartered Accountants of India (ICAI)", category: "finance",
    description: "Entry-level exam for the Chartered Accountancy course in India.",
    eligibility: "10+2 from a recognized board.",
    officialUrl: "https://icai.org",     pattern: { subjectsCovered: ["Accounting", "Business Law", "Quant", "Business Economics"], sections: ["Paper 1-4"], questionType: "Mixed (Descriptive + MCQ)", duration: "3 hours per paper", marking: "As per ICAI scheme", mode: "Pen and paper" },
    roadmap: financeCommerceRoadmap() },

  { name: "CMA Foundation", authority: "Institute of Cost Accountants of India (ICMAI)", category: "finance",
    description: "Entry-level exam for the Cost and Management Accountancy course in India.",
    eligibility: "10+2 from a recognized board.",
    officialUrl: "https://icmai.in",     pattern: { subjectsCovered: ["Accounting", "Laws and Ethics", "Economics", "Quant"], sections: ["Paper 1-4"], questionType: "MCQ", duration: "3 hours per paper", marking: "As per ICMAI scheme", mode: "Pen and paper / CBT" },
    roadmap: financeCommerceRoadmap() },

  { name: "CFA Level 1", authority: "CFA Institute", category: "finance",
    description: "First level of the globally recognized Chartered Financial Analyst program.",
    eligibility: "Bachelor's degree (or in final year) or equivalent professional experience.",
    officialUrl: "https://cfainstitute.org",     pattern: { subjectsCovered: ["Ethics", "Quant Methods", "Economics", "Financial Reporting", "Corporate Finance"], sections: ["Session 1", "Session 2"], questionType: "MCQ", duration: "2 hours 15 minutes per session", marking: "No negative marking", mode: "Computer-based test" },
    roadmap: financeCommerceRoadmap() },

  { name: "NIFT Entrance", authority: "National Institute of Fashion Technology (NIFT)", category: "design",
    description: "Entrance exam for undergraduate and postgraduate design/management programs at NIFT campuses.",
    eligibility: "10+2 (UG) or Bachelor's degree (PG), varies by program.",
    officialUrl: "https://nift.ac.in",     pattern: { subjectsCovered: ["Creative Ability Test", "General Ability Test"], sections: ["CAT", "GAT", "Situation Test/Interview"], questionType: "Mixed (Sketching + MCQ)", duration: "3 hours (combined)", marking: "As per NIFT scheme", mode: "Pen and paper" },
    roadmap: designRoadmap() },

  { name: "NID DAT", authority: "National Institute of Design (NID)", category: "design",
    description: "Design Aptitude Test for undergraduate and postgraduate programs at NID.",
    eligibility: "10+2 (UG) or Bachelor's degree (PG), varies by program.",
    officialUrl: "https://admissions.nid.edu",     pattern: { subjectsCovered: ["Design Aptitude", "General Knowledge", "Analytical Ability"], sections: ["Prelims (written)", "Mains (studio test + interview)"], questionType: "Mixed", duration: "3 hours (Prelims)", marking: "As per NID scheme", mode: "Pen and paper" },
    roadmap: designRoadmap() },
];

export function buildExamCatalog() {
  return RAW_EXAMS.map((raw) => {
    const slug = slugify(raw.name);
    const updates = {
      "neet-ug": "NEET UG 2026 notices, results, answer keys and syllabus are published on the official NTA NEET portal.",
      "jee-main": "JEE Main 2026 bulletins, session notices, answer keys and score information are published on the official NTA JEE Main portal.",
      "jee-advanced": "JEE Advanced 2026 schedule, brochure, answer keys and results are published on the official JEE Advanced portal.",
      "upsc-civil-services": "UPSC publishes the current Civil Services calendar, notifications, examination notices and results on its official portal.",
      "gate-cse": "GATE 2026 is organized by IIT Guwahati; the official GATE 2026 portal publishes the schedule, syllabus, mock-test links, papers and results.",
      "ugc-net": "UGC-NET 2026 notices, bulletins, schedules, answer keys and results are published on the official NTA UGC-NET portal.",
    };
    const currentTimeline = {
      "neet-ug": commonTimeline({ examDate: "03 May 2026 (NEET UG 2026 main examination); a re-examination was conducted for affected candidates on 21 June 2026." }),
      "jee-advanced": commonTimeline({
        registrationStart: "23 April 2026, 10:00 IST", registrationEnd: "02 May 2026, 23:59 IST",
        admitCard: "11 May 2026, 10:00 IST", examDate: "17 May 2026 — Paper 1: 09:00–12:00 IST; Paper 2: 14:30–17:30 IST",
        answerKey: "25 May 2026 — provisional answer key; final answer key and results: 01 June 2026", result: "01 June 2026, 10:00 IST"
      }),
      "upsc-civil-services": commonTimeline({ notification: "04 February 2026", registrationEnd: "27 February 2026, 18:00 IST", admitCard: "15 May 2026", examDate: "24 May 2026 — Civil Services Preliminary Examination" }),
      "gate-cse": commonTimeline({ registrationStart: "28 August 2025", registrationEnd: "07 October 2025 without late fee / 13 October 2025 with late fee", admitCard: "13 January 2026", examDate: "07, 08, 14 and 15 February 2026", result: "19 March 2026" }),
      "jee-main": commonTimeline({ notification: "NTA JEE Main 2026 official bulletin and notices are published on the JEE Main portal.", examDate: "Session 1: 21–24 January 2026 and 28–29 January 2026; Session 2: April 2026 dates published in the official notices.", result: "NTA published the 2026 Session-II Paper 1 and Paper 2 score information on the official portal." }),
      "ctet": commonTimeline({ examDate: "CTET September 2026 — official examination dates are published in the CTET September 2026 information bulletin.", correction: "CTET September 2026 correction window closed on 10 September 2026." }),
      "clat": commonTimeline({ registrationStart: "01 August 2025", registrationEnd: "31 October 2025, 23:59 IST", examDate: "07 December 2025, 14:00–16:00 IST for CLAT 2026", result: "CLAT 2026 admission/counselling information is published on the Consortium portal." }),
      "ibps-po": commonTimeline({ registrationStart: "18 June 2026", registrationEnd: "08 July 2026", examDate: "Preliminary examination: 22–23 August 2026; Main examination: 04 October 2026" }),
      "ibps-clerk": commonTimeline({ examDate: "CRP CSA-XVI preliminary examination: 10–11 October 2026; Main examination: 27 December 2026" }),
    };
    return {
      slug,
      name: raw.name,
      category: raw.category,
      authority: raw.authority,
      description: raw.description,
      eligibility: raw.eligibility,
      officialUrl: raw.officialUrl,
      applicationUrl: raw.applicationUrl || raw.officialUrl,
      sourceVerifiedAt: "Official authority portal",
      timeline: currentTimeline[slug] || commonTimeline(),
      applicationProcedure: standardApplicationProcedure,
      examPattern: raw.pattern,
      dressCode: standardDressCode,
      updatesNote: updates[slug] || "Check the official examination authority portal for the latest notification and current-cycle schedule.",
      subjects: withIds(slug, raw.roadmap),
    };
  });
}

export function examCategories() {
  return [...new Set(RAW_EXAMS.map((e) => e.category))];
}
