import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import { getUiThemeVars } from "./theme/uiTheme";
import TypingLogo from "./views/chat/components/TypingLogo";

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  duration: number;
  driftX: number;
  driftY: number;
  color: string;
  twinkleSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

function StarsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarRef = useRef<ShootingStar | null>(null);
  const animationRef = useRef<number>(0);

  const starColors = [
    "255, 255, 255",      // white
    "200, 220, 255",      // pale blue
    "255, 250, 230",      // warm white
    "180, 200, 255",      // light blue
    "255, 240, 200",      // pale yellow
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    // Initialize stars with enhanced properties
    starsRef.current = Array.from({ length: 120 }, () => {
      const color = starColors[Math.floor(Math.random() * starColors.length)];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5,
        baseOpacity: Math.random() * 0.4 + 0.15,
        opacity: Math.random() * 0.4 + 0.15,
        duration: Math.random() * 4000 + 2000,
        driftX: (Math.random() - 0.5) * 0.3,
        driftY: (Math.random() - 0.5) * 0.2,
        color,
        twinkleSpeed: Math.random() * 0.002 + 0.001,
      };
    });

    let startTime = performance.now();
    let lastShootingStar = -15000; // Start shooting star after 15s

    const triggerShootingStar = () => {
      const startX = Math.random() * canvas.width * 0.8;
      const startY = Math.random() * canvas.height * 0.3;
      shootingStarRef.current = {
        x: startX,
        y: startY,
        length: Math.random() * 80 + 60,
        speed: Math.random() * 15 + 10,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        opacity: 1,
        active: true,
      };
      lastShootingStar = performance.now();
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animate and draw stars
      starsRef.current.forEach((star) => {
        // Twinkle animation
        const twinkle = Math.sin(elapsed * star.twinkleSpeed);
        star.opacity = star.baseOpacity + twinkle * 0.15;

        // Drift animation
        const driftOffset = Math.sin(elapsed * 0.0003);
        const currentX = star.x + star.driftX * driftOffset;
        const currentY = star.y + star.driftY * driftOffset;

        // Draw star with glow
        const gradient = ctx.createRadialGradient(
          currentX, currentY, 0,
          currentX, currentY, star.size * 3
        );
        gradient.addColorStop(0, `rgba(${star.color}, ${star.opacity})`);
        gradient.addColorStop(0.4, `rgba(${star.color}, ${star.opacity * 0.4})`);
        gradient.addColorStop(1, `rgba(${star.color}, 0)`);

        ctx.beginPath();
        ctx.arc(currentX, currentY, star.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw star core
        ctx.beginPath();
        ctx.arc(currentX, currentY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${star.opacity})`;
        ctx.fill();
      });

      // Shooting star logic
      if (currentTime - lastShootingStar > 12000 + Math.random() * 8000) {
        if (!shootingStarRef.current?.active) {
          triggerShootingStar();
        }
      }

      // Draw shooting star
      if (shootingStarRef.current?.active) {
        const ss = shootingStarRef.current;
        const dx = Math.cos(ss.angle) * ss.speed;
        const dy = Math.sin(ss.angle) * ss.speed;

        ss.x += dx;
        ss.y += dy;
        ss.opacity -= 0.015;

        if (ss.opacity <= 0 || ss.x > canvas.width || ss.y > canvas.height) {
          ss.active = false;
          shootingStarRef.current = null;
        } else {
          // Draw shooting star trail
          const gradient = ctx.createLinearGradient(
            ss.x, ss.y,
            ss.x - Math.cos(ss.angle) * ss.length,
            ss.y - Math.sin(ss.angle) * ss.length
          );
          gradient.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
          gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.lineTo(
            ss.x - Math.cos(ss.angle) * ss.length,
            ss.y - Math.sin(ss.angle) * ss.length
          );
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.stroke();

          // Star head glow
          const headGradient = ctx.createRadialGradient(
            ss.x, ss.y, 0,
            ss.x, ss.y, 6
          );
          headGradient.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
          headGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
          ctx.beginPath();
          ctx.arc(ss.x, ss.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = headGradient;
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ opacity: 0.8 }}
    />
  );
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/15 ${className}`}
      style={{
        background: "var(--app-glass-bg)",
        borderColor: "var(--app-glass-border)",
      }}
    >
      {children}
    </div>
  );
}

export default function App() {
  const { theme } = useTheme();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartChat = () => {
    if (token) {
      navigate("/chat");
    } else {
      navigate("/login");
    }
  };

  const pageStyle = {
    ...getUiThemeVars(theme),
    background: "var(--app-bg)",
    fontFamily: '"DM Sans", "Sora", "Segoe UI", sans-serif',
  } as CSSProperties;

  return (
    <main className="relative flex h-dvh overflow-hidden" style={pageStyle}>
      {/* Radial Glow */}
      <div
        className="pointer-events-none absolute -left-1/4 top-1/2 h-[800px] w-[800px] -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, var(--app-glow) 0%, transparent 70%)",
        }}
      />

      {/* Left Brand Section */}
      <section
        className={`relative flex w-[45%] flex-col justify-center overflow-hidden px-12 transition-all duration-700 ${
          mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
        }`}
      >
        {/* Stars Background */}
        <StarsBackground />

        {/* Geometric Decorations */}
        <div
          className="pointer-events-none absolute left-8 top-12 h-20 w-20 opacity-20"
          style={{
            borderLeft: "2px solid var(--app-text-secondary)",
            borderTop: "2px solid var(--app-text-secondary)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-16 right-12 h-32 w-32 opacity-10"
          style={{
            borderRight: "2px solid var(--app-text-muted)",
            borderBottom: "2px solid var(--app-text-muted)",
          }}
        />

        {/* Brand Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <TypingLogo state="idle" />
            <span
              className="text-sm font-medium tracking-[0.3em] uppercase"
              style={{ color: "var(--app-text-secondary)" }}
            >
              AI Assistant
            </span>
          </div>

          <h1
            className="mt-8 text-7xl font-bold tracking-tight"
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              color: "var(--app-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            ASTRAL
          </h1>

          <p
            className="mt-4 text-lg leading-relaxed"
            style={{ color: "var(--app-text-secondary)" }}
          >
            你的星际 AI 助手
            <br />
            探索无限，思考无界
          </p>

          {/* Decorative Line */}
          <div
            className="mt-8 h-px w-24"
            style={{
              background:
                "linear-gradient(90deg, var(--highlight), transparent)",
            }}
          />
        </div>
      </section>

      {/* Right Feature Section */}
      <section
        className={`flex flex-1 items-center justify-center p-12 transition-all duration-700 delay-150 ${
          mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
        }`}
      >
        <div className="w-full max-w-md space-y-6">
          {/* Main Card: Start Chat */}
          <GlassCard className="p-8">
            <h2
              className="text-sm font-medium uppercase tracking-wider"
              style={{ color: "var(--app-text-muted)" }}
            >
              开始对话
            </h2>

            <div className="mt-6 flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "var(--app-surface)" }}
              >
                <svg
                  className="h-6 w-6"
                  style={{ color: "var(--highlight)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <p
                  className="font-medium"
                  style={{ color: "var(--app-text-primary)" }}
                >
                  与 AI 对话
                </p>
                <p
                  className="mt-1 text-sm"
                  style={{ color: "var(--app-text-secondary)" }}
                >
                  开启智能对话体验
                </p>
              </div>

              <button
                onClick={handleStartChat}
                className="group relative overflow-hidden rounded-full px-6 py-3 font-medium transition-all hover:scale-105"
                style={{
                  background: "var(--highlight)",
                  color: "#ffffff",
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  开始
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </GlassCard>

          {/* Secondary Cards Row */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-6">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: "var(--app-surface)" }}
              >
                <svg
                  className="h-5 w-5"
                  style={{ color: "var(--app-text-secondary)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p
                className="mt-4 font-medium"
                style={{ color: "var(--app-text-primary)" }}
              >
                历史记录
              </p>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--app-text-secondary)" }}
              >
                查看过往对话
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: "var(--app-surface)" }}
              >
                <svg
                  className="h-5 w-5"
                  style={{ color: "var(--app-text-secondary)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p
                className="mt-4 font-medium"
                style={{ color: "var(--app-text-primary)" }}
              >
                设置
              </p>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--app-text-secondary)" }}
              >
                个性化配置
              </p>
            </GlassCard>
          </div>

          {/* Footer */}
          <p
            className="text-center text-sm"
            style={{ color: "var(--app-text-muted)" }}
          >
            &copy; {new Date().getFullYear()} Astral AI. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}
