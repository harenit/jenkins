import { useState } from "react";

export default function FlipCard({ question, answer, footer }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="pc-flip-card" onClick={() => setFlipped((f) => !f)}>
      <div className={`pc-flip-card-inner ${flipped ? "flipped" : ""}`}>
        <div className="pc-flip-card-face pc-flip-card-front">
          <div className="pc-flip-card-label">Question</div>
          <div className="pc-flip-card-text">{question}</div>
          <div className="pc-flip-card-hint">Tap to flip</div>
        </div>
        <div className="pc-flip-card-face pc-flip-card-back">
          <div className="pc-flip-card-label">Answer</div>
          <div className="pc-flip-card-text">{answer}</div>
        </div>
      </div>
      {footer && <div className="pc-flip-card-footer" onClick={(e) => e.stopPropagation()}>{footer}</div>}
    </div>
  );
}
