import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";

const COACH_STEPS = [
  {
    selector: '[data-tour="nav-exams"]',
    title: "🧭 Target Exams & Discovery",
    subtitle: "Step 1 of 7 · Navigation Hub",
    badge: "Exam Explorer",
    content:
      "Explore 30+ competitive exams categorized by discipline. Select your exam to unlock personalized syllabus roadmaps, official mocks, and smart study tools.",
    tip: "Registering an exam customizes your syllabus roadmaps, quizzes, and practice drills.",
    placement: "right",
  },
  {
    selector: '[data-tour="exam-search"]',
    title: "🔍 Smart Search & Filtering",
    subtitle: "Step 2 of 7 · Find Your Exam",
    badge: "Filter Bar",
    content:
      "Quickly search exams by name, discipline, or authority. Toggle between your Registered and Unregistered exams in real time.",
    tip: "Use the category dropdown to filter across Engineering, Medical, Civil Services, and more.",
    placement: "bottom",
  },
  {
    selector: '[data-tour="recent-accessed"]',
    title: "⏱️ Recently Accessed Hub",
    subtitle: "Step 3 of 7 · Quick Continuity",
    badge: "Quick Access",
    content:
      "Never lose track of where you left off. Your enrolled exams, recent topics, and mock drill summaries are always front and center for 1-click continuation.",
    tip: "Click any card to jump right back into that exam's syllabus and quizzes.",
    placement: "bottom",
  },
  {
    selector: '[data-tour="nav-myProgress"]',
    fallbackSelector: '[data-tour="nav-progress"]',
    title: "📈 My Progress & Mock Analytics",
    subtitle: "Step 4 of 7 · Mastery Tracking",
    badge: "Performance & Graphs",
    content:
      "Track your syllabus completion percentage, log mock test scores across multiple attempts, and click 'Analysis' to render visual trend graphs of your scores.",
    tip: "Removing an exam here immediately prunes it from your dashboard without leaving orphan data.",
    placement: "right",
  },
  {
    selector: '[data-tour="nav-marketplace"]',
    title: "📚 Textbook Marketplace",
    subtitle: "Step 5 of 7 · Peer-to-Peer Books",
    badge: "Student Marketplace",
    content:
      "Buy affordable secondhand textbooks, list your completed books for sale or free donation, and order doorstep courier pickups right from your campus.",
    tip: "Fellow students can claim free donated books for ₹0 with verified logistics tracking.",
    placement: "right",
  },
  {
    selector: '[data-tour="nav-resources"]',
    title: "🗂️ Resources & Shared PDFs",
    subtitle: "Step 6 of 7 · Community Library",
    badge: "Digital Materials",
    content:
      "Browse official exam portals, download community PDFs and handwritten notes, claim free ₹0 materials into your library, or share your own notes with peers.",
    tip: "Add any shared PDF directly to your library or download it for offline revision.",
    placement: "right",
  },
  {
    selector: '[data-tour="top-utility-bar"]',
    title: "🌐 Universal Language & Accessibility",
    subtitle: "Step 7 of 7 · Accessibility",
    badge: "Universal Comfort",
    content:
      "Switch the entire application — including dynamic textbooks, buttons, and roadmaps — into Tamil, Hindi, or 6 other regional languages via Google Translate, and scale font sizes up to 22px anytime.",
    tip: "Language and font sizing persist seamlessly across all pages and user roles.",
    placement: "bottom",
  },
];

export default function GuidedTour({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetBox, setTargetBox] = useState(null);
  const cardRef = useRef(null);

  const step = COACH_STEPS[currentStep] || COACH_STEPS[0];

  // Measure target DOM element
  useEffect(() => {
    if (!isOpen) {
      setTargetBox(null);
      return;
    }

    function updateTarget() {
      let el = document.querySelector(step.selector);
      if (!el && step.fallbackSelector) {
        el = document.querySelector(step.fallbackSelector);
      }

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        const rect = el.getBoundingClientRect();
        const pad = 8;
        setTargetBox({
          top: Math.max(0, rect.top - pad),
          left: Math.max(0, rect.left - pad),
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
          bottom: rect.bottom + pad,
          right: rect.right + pad,
          found: true,
        });
      } else {
        // Fallback center position
        setTargetBox({
          top: window.innerHeight / 2 - 120,
          left: window.innerWidth / 2 - 200,
          width: 400,
          height: 240,
          found: false,
        });
      }
    }

    updateTarget();
    const handleScrollOrResize = () => updateTarget();
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    const timer = setTimeout(updateTarget, 100);

    return () => {
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      clearTimeout(timer);
    };
  }, [isOpen, currentStep, step]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  function handleNext() {
    if (currentStep < COACH_STEPS.length - 1) {
      setCurrentStep((c) => c + 1);
    } else {
      localStorage.setItem("prepcycle_tour_viewed", "true");
      onClose();
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep((c) => c - 1);
    }
  }

  // Calculate Coach Mark card position
  let cardStyle = {
    position: "fixed",
    zIndex: 999999,
    width: "420px",
    maxWidth: "calc(100vw - 32px)",
    background: "var(--pc-card, #ffffff)",
    color: "var(--pc-text, #1e293b)",
    borderRadius: 16,
    padding: "22px 24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15)",
    border: "2px solid #3b82f6",
    transition: "top 0.3s ease, left 0.3s ease",
  };

  let arrowStyle = {
    position: "absolute",
    width: 0,
    height: 0,
    borderStyle: "solid",
  };

  if (targetBox && targetBox.found) {
    const isSidebarTarget = targetBox.left < 280;
    const isTopTarget = targetBox.top < 120 && targetBox.left > 280;

    if (isSidebarTarget) {
      // Position to the right of the sidebar element
      const topPos = Math.min(
        Math.max(16, targetBox.top - 20),
        window.innerHeight - 380
      );
      const leftPos = Math.min(targetBox.right + 18, window.innerWidth - 440);
      cardStyle.top = `${topPos}px`;
      cardStyle.left = `${leftPos}px`;

      // Left-pointing arrow
      arrowStyle = {
        top: Math.max(20, Math.min(targetBox.top - topPos + targetBox.height / 2 - 8, 280)),
        left: "-12px",
        borderWidth: "8px 12px 8px 0",
        borderColor: "transparent #3b82f6 transparent transparent",
      };
    } else if (isTopTarget) {
      // Position below the top element
      const topPos = Math.min(targetBox.bottom + 18, window.innerHeight - 380);
      const leftPos = Math.max(16, Math.min(targetBox.left - 160, window.innerWidth - 440));
      cardStyle.top = `${topPos}px`;
      cardStyle.left = `${leftPos}px`;

      // Up-pointing arrow
      arrowStyle = {
        top: "-12px",
        right: "60px",
        borderWidth: "0 8px 12px 8px",
        borderColor: "transparent transparent #3b82f6 transparent",
      };
    } else {
      // Default: below or above element
      const fitsBelow = targetBox.bottom + 360 < window.innerHeight;
      const topPos = fitsBelow
        ? targetBox.bottom + 18
        : Math.max(16, targetBox.top - 360);
      const leftPos = Math.max(16, Math.min(targetBox.left, window.innerWidth - 440));

      cardStyle.top = `${topPos}px`;
      cardStyle.left = `${leftPos}px`;

      if (fitsBelow) {
        arrowStyle = {
          top: "-12px",
          left: "24px",
          borderWidth: "0 8px 12px 8px",
          borderColor: "transparent transparent #3b82f6 transparent",
        };
      } else {
        arrowStyle = {
          bottom: "-12px",
          left: "24px",
          borderWidth: "12px 8px 0 8px",
          borderColor: "#3b82f6 transparent transparent transparent",
        };
      }
    }
  } else {
    // Center card if target not found
    cardStyle.top = "50%";
    cardStyle.left = "50%";
    cardStyle.transform = "translate(-50%, -50%)";
  }

  return (
    <>
      {/* 1. BACKDROP CUTOUT SPOTLIGHT WITH ANIMATED PULSE BEACON */}
      {targetBox && targetBox.found && (
        <div
          style={{
            position: "fixed",
            top: targetBox.top,
            left: targetBox.left,
            width: targetBox.width,
            height: targetBox.height,
            borderRadius: 12,
            boxShadow:
              "0 0 0 9999px rgba(15, 23, 42, 0.78), 0 0 0 3px #3b82f6, 0 0 30px rgba(59, 130, 246, 0.9)",
            pointerEvents: "none",
            zIndex: 999990,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Animated Pulsing Beacon Dot */}
          <div
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#3b82f6",
              boxShadow: "0 0 10px #60a5fa",
              animation: "pcBeaconPing 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
            }}
          />
        </div>
      )}

      {/* Dimmed backdrop fallback if target not found */}
      {(!targetBox || !targetBox.found) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.78)",
            zIndex: 999990,
          }}
          onClick={onClose}
        />
      )}

      {/* 2. COACH MARK CARD */}
      <div ref={cardRef} style={cardStyle} onClick={(e) => e.stopPropagation()}>
        {/* Directional pointer arrow */}
        {targetBox && targetBox.found && <div style={arrowStyle} />}

        {/* Step indicator top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {COACH_STEPS.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: idx === currentStep ? "24px" : "7px",
                  height: "7px",
                  borderRadius: "4px",
                  background: idx === currentStep ? "var(--pc-primary, #2563eb)" : "var(--pc-border, #cbd5e1)",
                  transition: "all 0.25s ease",
                  display: "inline-block",
                }}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            type="button"
            className="pc-link-btn"
            style={{ fontSize: "12.5px", color: "var(--pc-text-muted, #64748b)", fontWeight: 600 }}
          >
            ✕ Skip Tour
          </button>
        </div>

        {/* Badge & Subtitle */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 6 }}>
          <span className="pc-badge pc-badge-primary" style={{ fontSize: "11px", padding: "3px 8px" }}>
            {step.badge}
          </span>
          <span style={{ fontSize: "12px", color: "var(--pc-text-muted, #64748b)", fontWeight: 600 }}>
            {step.subtitle}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "4px 0 10px", color: "var(--pc-text, #0f172a)" }}>
          {step.title}
        </h3>

        {/* Content */}
        <p style={{ fontSize: "13.5px", lineHeight: 1.55, color: "var(--pc-text-muted, #475569)", margin: "0 0 14px" }}>
          {step.content}
        </p>

        {/* Pro Tip Box */}
        <div
          style={{
            background: "rgba(37, 99, 235, 0.08)",
            borderLeft: "4px solid var(--pc-primary, #2563eb)",
            padding: "8px 12px",
            borderRadius: "0 8px 8px 0",
            marginBottom: 18,
            fontSize: "12.5px",
            color: "var(--pc-text, #1e293b)",
          }}
        >
          💡 <strong>Tip:</strong> {step.tip}
        </div>

        {/* Navigation Action Buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            type="button"
            className="pc-btn pc-btn-outline pc-btn-small"
            onClick={handlePrev}
            disabled={currentStep === 0}
            style={{ opacity: currentStep === 0 ? 0.35 : 1, fontSize: "12px", padding: "6px 12px" }}
          >
            ← Previous
          </button>

          <div style={{ display: "flex", gap: "8px" }}>
            {currentStep < COACH_STEPS.length - 1 ? (
              <button
                type="button"
                className="pc-btn pc-btn-primary pc-btn-small"
                onClick={handleNext}
                style={{ fontSize: "12px", padding: "6px 14px" }}
              >
                Next Feature →
              </button>
            ) : (
              <button
                type="button"
                className="pc-btn pc-btn-primary pc-btn-small"
                onClick={handleNext}
                style={{ fontSize: "12px", padding: "6px 14px", background: "#16a34a" }}
              >
                🎉 Got it! Finish Tour
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
