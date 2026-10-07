import { useEffect, useRef, useState } from "react";

export default function Auth3DVisual() {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const animFrameRef = useRef(null);
  const targetTilt = useRef({ x: 0, y: 0 });
  const currentTilt = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      // Normalized mouse coordinates from -1 to 1
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;

      // Max tilt angles: pitch up to 18 deg, yaw up to 22 deg
      targetTilt.current = {
        x: -y * 16,
        y: x * 20,
      };
    };

    const handleMouseLeave = () => {
      targetTilt.current = { x: 0, y: 0 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    // Smooth Lerp loop for fluid physics
    const updateTilt = () => {
      currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * 0.08;
      currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * 0.08;

      setTilt({
        x: parseFloat(currentTilt.current.x.toFixed(2)),
        y: parseFloat(currentTilt.current.y.toFixed(2)),
      });

      animFrameRef.current = requestAnimationFrame(updateTilt);
    };

    animFrameRef.current = requestAnimationFrame(updateTilt);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "380px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1200px",
        position: "relative",
        userSelect: "none",
      }}
    >
      <style>{`
        @keyframes floatCentralBooks {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-14px) rotate(0.8deg);
          }
        }

        @keyframes floatGradCap {
          0%, 100% {
            transform: translateY(0px) rotate(-1.5deg) scale(1);
          }
          45% {
            transform: translateY(-22px) rotate(2.5deg) scale(1.03);
          }
          75% {
            transform: translateY(-10px) rotate(0.5deg) scale(1.01);
          }
        }

        @keyframes floatCloudTR {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(10px, -16px) scale(1.04);
          }
        }

        @keyframes floatCloudLeft {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(-10px, -12px) scale(1.05);
          }
        }

        @keyframes floatCloudBR {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(8px, -10px) scale(1.03);
          }
        }

        @keyframes shadowBreathe {
          0%, 100% {
            transform: scale(1) translateX(-50%);
            opacity: 0.45;
            filter: blur(14px);
          }
          50% {
            transform: scale(0.8) translateX(-50%);
            opacity: 0.22;
            filter: blur(20px);
          }
        }

        @keyframes pulseHalo {
          0%, 100% {
            opacity: 0.55;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.85;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }

        @keyframes floatSparkle {
          0% {
            transform: translateY(0) scale(0.6) rotate(0deg);
            opacity: 0;
          }
          30% {
            opacity: 0.9;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-55px) scale(1.1) rotate(180deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* 3D Rotational Stage Container (responds to mouse tilt) */}
      <div
        style={{
          width: "320px",
          height: "320px",
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.08s ease-out",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Ambient Back Glow Halo */}
        <div
          style={{
            position: "absolute",
            top: "48%",
            left: "50%",
            width: "280px",
            height: "280px",
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(99, 102, 241, 0.18) 50%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
            transform: "translate(-50%, -50%) translateZ(-40px)",
            animation: "pulseHalo 6s ease-in-out infinite",
          }}
        />

        {/* Dynamic Floor Shadow */}
        <div
          style={{
            position: "absolute",
            bottom: "8px",
            left: "50%",
            width: "190px",
            height: "32px",
            background: "radial-gradient(ellipse at center, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0) 75%)",
            borderRadius: "50%",
            pointerEvents: "none",
            transform: "translateX(-50%) translateZ(-10px)",
            animation: "shadowBreathe 4.6s ease-in-out infinite",
          }}
        />

        {/* 1. LAYER: Books & Ladder (Central floating core) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transform: "translateZ(30px)",
            animation: "floatCentralBooks 4.6s ease-in-out infinite",
          }}
        >
          <img
            src="/login_3d_books.png"
            alt="3D Knowledge Books"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 14px 24px rgba(14, 165, 233, 0.15))",
            }}
          />
        </div>

        {/* 2. LAYER: Graduation Cap (Hovers and floats independently above the books) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transform: "translateZ(75px)",
            animation: "floatGradCap 3.8s ease-in-out infinite",
            filter: "drop-shadow(0 12px 18px rgba(0, 0, 0, 0.22))",
          }}
        >
          <img
            src="/login_3d_cap.png"
            alt="3D Floating Graduation Cap"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* 3. LAYER: Top-Right Fluffy Cloud (Floating and drifting in 3D) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transform: "translateZ(55px)",
            animation: "floatCloudTR 5.2s ease-in-out infinite",
            filter: "drop-shadow(0 8px 16px rgba(255, 255, 255, 0.2))",
          }}
        >
          <img
            src="/login_3d_cloud_tr.png"
            alt="3D Floating Cloud"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* 4. LAYER: Left Cloud (Floating softly) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transform: "translateZ(45px)",
            animation: "floatCloudLeft 6.4s ease-in-out infinite",
            filter: "drop-shadow(0 8px 16px rgba(255, 255, 255, 0.2))",
          }}
        >
          <img
            src="/login_3d_cloud_l.png"
            alt="3D Floating Cloud Left"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* 5. LAYER: Bottom-Right Cloud (Floating near ladder) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            transform: "translateZ(65px)",
            animation: "floatCloudBR 4.8s ease-in-out infinite",
            filter: "drop-shadow(0 8px 16px rgba(255, 255, 255, 0.2))",
          }}
        >
          <img
            src="/login_3d_cloud_br.png"
            alt="3D Floating Cloud Bottom"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* 6. LAYER: Floating 3D Sparkles & Academic Stars */}
        {[
          { top: "18%", left: "72%", delay: "0s", size: "14px", color: "#fbbf24" },
          { top: "35%", left: "18%", delay: "1.4s", size: "12px", color: "#60a5fa" },
          { top: "65%", left: "82%", delay: "2.1s", size: "16px", color: "#38bdf8" },
          { top: "78%", left: "28%", delay: "0.8s", size: "11px", color: "#fef08a" },
        ].map((star, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: star.top,
              left: star.left,
              fontSize: star.size,
              color: star.color,
              pointerEvents: "none",
              transformStyle: "preserve-3d",
              transform: "translateZ(85px)",
              animation: `floatSparkle 3.5s ease-in-out infinite`,
              animationDelay: star.delay,
              filter: `drop-shadow(0 0 6px ${star.color})`,
            }}
          >
            ✦
          </div>
        ))}
      </div>
    </div>
  );
}
