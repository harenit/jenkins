import { useEffect, useRef, useState } from "react";
import api from "../../api";
import "./OwlMascot.css";

const FALLBACK_QUOTES = ["Keep going — you've got this!"];
const FALLBACK_INTERVAL_MS = 60000;

const TRACK_WIDTH = 260; // px - width of the walking lane
const OWL_WIDTH = 64; // px - approx footprint of the owl SVG
const SPEED_PX_PER_SEC = 28;

// Module-level guard: React 18 (esp. under StrictMode, or if a parent
// re-renders the tree) must never end up with two owls mounted at once.
let mascotInstanceActive = false;

export default function OwlMascot() {
  const [canRender, setCanRender] = useState(false);
  const [quotes, setQuotes] = useState(FALLBACK_QUOTES);
  const [intervalMs, setIntervalMs] = useState(FALLBACK_INTERVAL_MS);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [usingFallback, setUsingFallback] = useState(false);

  const [x, setX] = useState(0);
  const [facing, setFacing] = useState("right"); // "right" | "left"
  const [walking, setWalking] = useState(true);

  const dirRef = useRef(1); // 1 = moving right, -1 = moving left
  const xRef = useRef(0);
  const lastTsRef = useRef(null);
  const rafRef = useRef(null);
  const quoteTimerRef = useRef(null);

  // ---- Singleton guard: only ever one owl mounted at a time ----
  useEffect(() => {
    if (mascotInstanceActive) {
      setCanRender(false);
      return;
    }
    mascotInstanceActive = true;
    setCanRender(true);
    return () => {
      mascotInstanceActive = false;
    };
  }, []);

  // ---- Fetch quotes + interval from the Node backend ----
  useEffect(() => {
    if (!canRender) return;
    let cancelled = false;

    api
      .quotes()
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data?.quotes) && data.quotes.length > 0) {
          setQuotes(data.quotes);
          setUsingFallback(false);
        }
        if (typeof data?.intervalMs === "number" && data.intervalMs > 0) {
          setIntervalMs(data.intervalMs);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setQuotes(FALLBACK_QUOTES);
        setIntervalMs(FALLBACK_INTERVAL_MS);
        setUsingFallback(true);
      });

    return () => {
      cancelled = true;
    };
  }, [canRender]);

  // ---- Quote rotation: one quote always visible, replaced every intervalMs ----
  useEffect(() => {
    if (!canRender) return;
    setQuoteIndex(0); // show the first quote immediately
    quoteTimerRef.current = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % Math.max(quotes.length, 1));
    }, intervalMs);

    return () => clearInterval(quoteTimerRef.current);
  }, [canRender, quotes, intervalMs]);

  // ---- Walking animation loop (horizontal only, bounded track) ----
  useEffect(() => {
    if (!canRender) return;

    function step(ts) {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dtSec = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const maxX = TRACK_WIDTH - OWL_WIDTH;
      let nextX = xRef.current + dirRef.current * SPEED_PX_PER_SEC * dtSec;

      if (nextX >= maxX) {
        nextX = maxX;
        dirRef.current = -1;
        setFacing("left");
      } else if (nextX <= 0) {
        nextX = 0;
        dirRef.current = 1;
        setFacing("right");
      }

      xRef.current = nextX;
      setX(nextX);
      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [canRender]);

  if (!canRender) return null;

  const currentQuote = quotes[quoteIndex] || FALLBACK_QUOTES[0];

  return (
    <div className="prepcycle-owl-region" id="prepcycleOwlMascot" aria-hidden="false">
      <div className="prepcycle-owl-track" style={{ transform: `translateX(${x}px)` }}>
        <div className="prepcycle-owl-quote" role="status">
          {currentQuote}
          {usingFallback && <span className="prepcycle-owl-offline-dot" title="Backend unavailable — showing a fallback quote" />}
        </div>

        <div
          className={`prepcycle-owl-figure ${walking ? "walking" : ""} ${facing === "left" ? "facing-left" : "facing-right"}`}
          onMouseEnter={() => setWalking(true)}
        >
          <OwlSvg />
        </div>
      </div>
    </div>
  );
}

function OwlSvg() {
  return (
    <svg viewBox="0 0 100 100" width="64" height="64" className="prepcycle-owl-svg">
      {/* body */}
      <ellipse className="owl-body" cx="50" cy="58" rx="30" ry="32" fill="#ffffff" stroke="#d8dee9" strokeWidth="2" />
      {/* graduation cap */}
      <g className="owl-cap">
        <rect x="34" y="18" width="32" height="6" rx="1" fill="#2b2d42" />
        <polygon points="50,6 78,21 50,28 22,21" fill="#2b2d42" />
        <circle cx="78" cy="21" r="2.2" fill="#f2b134" />
        <line x1="78" y1="21" x2="82" y2="34" stroke="#f2b134" strokeWidth="1.6" />
        <circle cx="82" cy="34" r="2.4" fill="#f2b134" />
      </g>
      {/* wings */}
      <ellipse className="owl-wing owl-wing-left" cx="27" cy="60" rx="8" ry="16" fill="#e7ecf5" stroke="#c8d1e0" strokeWidth="1.5" />
      <ellipse className="owl-wing owl-wing-right" cx="73" cy="60" rx="8" ry="16" fill="#e7ecf5" stroke="#c8d1e0" strokeWidth="1.5" />
      {/* face */}
      <circle cx="38" cy="50" r="11" fill="#ffffff" stroke="#2b2d42" strokeWidth="2" />
      <circle cx="62" cy="50" r="11" fill="#ffffff" stroke="#2b2d42" strokeWidth="2" />
      <circle cx="38" cy="50" r="4" fill="#2b2d42" />
      <circle cx="62" cy="50" r="4" fill="#2b2d42" />
      {/* glasses bridge */}
      <line x1="49" y1="50" x2="51" y2="50" stroke="#2b2d42" strokeWidth="2" />
      {/* beak */}
      <polygon points="50,56 46,63 54,63" fill="#f2b134" />
      {/* feet */}
      <g className="owl-feet">
        <polygon className="owl-foot owl-foot-left" points="40,88 36,96 44,96" fill="#f2b134" />
        <polygon className="owl-foot owl-foot-right" points="60,88 56,96 64,96" fill="#f2b134" />
      </g>
    </svg>
  );
}
