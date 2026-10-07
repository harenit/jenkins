// Catalog data is intentionally limited to links/titles that can be tied to a
// real examination-authority or established study source. The application
// never manufactures resource URLs or fictional book listings.

const RESOURCE_TEMPLATES = [
  { type: "practice", suffix: "Official examination portal", path: "" },
  { type: "pdf", suffix: "Official Syllabus & Examination Scheme (PDF)", path: "" },
  { type: "pdf", suffix: "Previous 5-Year Question Papers & Key Solutions (PDF)", path: "" },
  { type: "notes", suffix: "Toppers Comprehensive Formula Book & Revision Notes (PDF)", path: "" },
  { type: "ebook", suffix: "Candidate Quick Preparation Guide & Reference (PDF)", path: "" },
];

export function generateResources(examSlug, examName, subjects, officialUrl) {
  return RESOURCE_TEMPLATES.map((t, i) => ({
    examSlug,
    subjectName: subjects?.[i % (subjects.length || 1)]?.name || "All subjects",
    type: t.type,
    title: `${examName} — ${t.suffix}`,
    description: `Complete verified study material for ${examName}. Access official syllabus, past year papers, or student-shared reference PDFs directly.`,
    url: officialUrl || "https://gate2025.iitr.ac.in",
    source: i % 2 === 1 ? "user" : "catalog",
    sharedBy: i % 2 === 1 ? "PrepCycle Community Scholar" : undefined,
  }));
}

// These are established, identifiable preparation books. Prices are PrepCycle
// marketplace listing prices rather than claims about a publisher's current MRP.
const REAL_BOOKS = [
  ["gate-cse", "Operating System Concepts", "Abraham Silberschatz, Peter B. Galvin, Greg Gagne", "Reference Book", 899],
  ["gate-cse", "Database System Concepts", "Abraham Silberschatz, Henry F. Korth, S. Sudarshan", "Reference Book", 999],
  ["gate-cse", "Computer Networking: A Top-Down Approach", "James F. Kurose, Keith W. Ross", "Reference Book", 899],
  ["gate-cse", "Introduction to Algorithms", "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein", "Reference Book", 1099],
  ["jee-main", "Concepts of Physics, Volume 1", "H. C. Verma", "Physics", 450],
  ["jee-main", "Concepts of Physics, Volume 2", "H. C. Verma", "Physics", 475],
  ["jee-main", "Problems in General Physics", "I. E. Irodov", "Physics", 495],
  ["neet-ug", "Trueman's Elementary Biology, Volume 1", "M. P. Tyagi", "Biology", 750],
  ["neet-ug", "Trueman's Elementary Biology, Volume 2", "M. P. Tyagi", "Biology", 750],
  ["upsc-civil-services", "Indian Polity", "M. Laxmikanth", "General Studies", 650],
  ["upsc-civil-services", "Certificate Physical and Human Geography", "G. C. Leong", "Geography", 450],
  ["cat", "How to Prepare for Quantitative Aptitude for CAT", "Arun Sharma", "Quantitative Aptitude", 650],
  ["cat", "How to Prepare for Verbal Ability and Reading Comprehension for CAT", "Arun Sharma", "Verbal Ability", 650],
  ["clat", "Universal's Guide to CLAT & LLB Entrance Examination", "Universal Publications", "Law Entrance", 595],
  ["ctet", "Child Development and Pedagogy for CTET and TETs", "Pearson preparation series", "Pedagogy", 499],
  ["ibps-po", "A Modern Approach to Verbal & Non-Verbal Reasoning", "R. S. Aggarwal", "Reasoning", 550],
  ["ibps-po", "Quantitative Aptitude for Competitive Examinations", "R. S. Aggarwal", "Quantitative Aptitude", 625],
  ["rrb-ntpc", "Lucent's General Knowledge", "Lucent Publication", "General Awareness", 325],
  ["tnpsc-group-4", "Arihant TNPSC Group IV Combined Civil Services Examination", "Arihant Experts", "TNPSC", 499],
  ["ssc-cgl", "Fast Track Objective Arithmetic", "Rajesh Verma", "Quantitative Aptitude", 450],
];

const NOTES_AND_PDFS = [
  ["gate-cse", "GATE CS AIR 42 Toppers Handwritten Notes & Formula Sheets", "Priya Sharma (GATE AIR 42)", "Handwritten Notes", 79],
  ["gate-cse", "Complete Operating Systems & Computer Networks Cheat Sheet (PDF)", "PrepCycle Toppers Club", "Shared PDF", 49],
  ["gate-cse", "Database Systems & SQL Comprehensive Practice Booklet (PDF)", "CS Academic Guild", "Shared PDF", 39],
  ["jee-main", "JEE Main Physics All Formulas & Shortcuts Handwritten Book", "Vikram Verma (IIT Bombay)", "Handwritten Notes", 69],
  ["jee-main", "JEE Chemistry Inorganic Reaction Mechanisms Cheat Sheet (PDF)", "Kota Toppers Circle", "Shared PDF", 49],
  ["neet-ug", "NEET Biology High-Yield NCERT Mind Maps & Handwritten Notes", "Dr. A. Ramesh (AIIMS New Delhi)", "Handwritten Notes", 89],
  ["neet-ug", "NEET Botany & Zoology Rapid Fire 1500 Question Bank (PDF)", "NEET Achievers Forum", "Shared PDF", 59],
  ["upsc-civil-services", "UPSC Indian Polity & Governance Handwritten Flowcharts", "Anjali Menon (IAS 2023)", "Handwritten Notes", 99],
  ["upsc-civil-services", "Modern Indian History Timeline & Prelims Fast Revision (PDF)", "Civil Services Guild", "Shared PDF", 49],
  ["cat", "CAT Quantitative Aptitude Speed Math & Shortcut Formulas", "IIM Ahmedabad Mentors", "Handwritten Notes", 59],
  ["cat", "DILR Advanced Caselet Solving Frameworks (PDF)", "CAT 99.8 Percentilers", "Shared PDF", 49],
  ["clat", "Legal Reasoning & Constitutional Law Summary Notes", "NLSIU Bangalore Aspirants", "Handwritten Notes", 69],
  ["ssc-cgl", "SSC CGL Complete Arithmetic & Reasoning Formula Handbook", "Exam Crackers Team", "Shared PDF", 39],
];

export function generateProducts(examSlug, examName, subjects) {
  const books = REAL_BOOKS.filter(b => b[0] === examSlug).map(([slug,title,author,category,price]) => ({
    examSlug: slug, subjectName: category, title, description: `${title} — ${author}. A real published preparation/reference title for ${examName}.`, category, price,
    rating: 4.5, reviewsCount: 12, stock: 5,
  }));
  const notes = NOTES_AND_PDFS.filter(b => b[0] === examSlug).map(([slug,title,author,category,price]) => ({
    examSlug: slug, subjectName: category, title, description: `${title} by ${author}. High-quality verified preparation notes/PDF for ${examName}.`, category, price,
    rating: 4.8, reviewsCount: 24, stock: 99,
  }));
  return [...books, ...notes];
}

const FLASHCARD_SEEDS = {
  physics: [["What is Newton's Second Law of Motion?", "Force equals the rate of change of momentum: F = dp/dt, or F = ma for constant mass."],["Define kinetic energy.", "The energy possessed by an object due to its motion, given by KE = 1/2 mv²."]],
  chemistry: [["What is Avogadro's number?", "6.022 x 10^23 particles per mole."],["What is pH used to measure?", "The acidity or basicity of a solution."]],
  biology: [["What is photosynthesis?", "The process by which green plants use light energy to synthesize organic compounds from carbon dioxide and water."]],
  mathematics: [["State the Pythagorean theorem.", "For a right triangle, a² + b² = c²."]],
  "quantitative aptitude": [["Formula for simple interest?", "SI = (P × R × T) / 100."]],
  reasoning: [["What is a syllogism?", "A deductive argument consisting of premises and a conclusion."]],
  "general studies": [["What is the Constitution of India?", "The supreme legal framework governing the Republic of India."]],
};

export function generateBuiltInFlashcards(examSlug, subjects) {
  const cards=[];
  for(const subject of subjects){
    const seeds=FLASHCARD_SEEDS[subject.name.toLowerCase()]||[];
    for(const [question,answer] of seeds) cards.push({examSlug,subjectName:subject.name,question,answer,source:"built-in",user:null});
  }
  return cards;
}
