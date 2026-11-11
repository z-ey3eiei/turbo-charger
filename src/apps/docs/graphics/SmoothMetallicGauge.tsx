import { useEffect, useRef } from "react";

export function SmoothMetallicGauge({
  className = "",
  externalValue = null,
}: {
  className?: string;
  externalValue?: number | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const START_DEG = 164;
    const END_DEG = 376;
    const TOTAL_SWEEP_DEG = END_DEG - START_DEG;
    const DEG_TO_RAD = Math.PI / 180;

    const state = {
      currentValue: 0.15,
      targetValue: 0.76,
      velocity: 0.0,
      arcLitValue: 0.76,
      syncArcWithNeedle: true,
      smoothness: 0.64,
      flutter: 0.42,
      autoTime: 0,
      externalTarget: externalValue !== undefined ? externalValue : null,
    };

    let width = 0;
    let height = 0;
    let dpr = 1;

    function resizeCanvas() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      width = rect.width || 480;
      height = rect.height || 360;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(canvas);
    resizeCanvas();

    function getGaugeColorAt(t: number, alpha = 1) {
      const p = Math.max(0, Math.min(1, t));
      const stops = [
        { pos: 0.0, r: 0, g: 140, b: 255 },
        { pos: 0.3, r: 40, g: 125, b: 255 },
        { pos: 0.52, r: 142, g: 84, b: 233 },
        { pos: 0.74, r: 218, g: 50, b: 135 },
        { pos: 1.0, r: 255, g: 28, b: 88 },
      ];
      let lower = stops[0];
      let upper = stops[stops.length - 1];
      for (let i = 0; i < stops.length - 1; i++) {
        if (p >= stops[i].pos && p <= stops[i + 1].pos) {
          lower = stops[i];
          upper = stops[i + 1];
          break;
        }
      }
      const range = upper.pos - lower.pos || 1;
      const localT = (p - lower.pos) / range;
      const r = Math.round(lower.r + (upper.r - lower.r) * localT);
      const g = Math.round(lower.g + (upper.g - lower.g) * localT);
      const b = Math.round(lower.b + (upper.b - lower.b) * localT);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function drawMetallicNeedle(
      cx: number,
      cy: number,
      radius: number,
      angleRad: number
    ) {
      if (!ctx) return;
      const needleLength = radius * 0.72;
      const baseHalfWidth = Math.max(6, radius * 0.032);
      const hubRadius = Math.max(16, radius * 0.095);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleRad);

      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
      ctx.beginPath();
      ctx.moveTo(0, -baseHalfWidth);
      ctx.lineTo(needleLength, 0);
      ctx.lineTo(0, baseHalfWidth);
      ctx.closePath();
      ctx.fillStyle = "#cbd5e1";
      ctx.fill();
      ctx.restore();

      const topGrad = ctx.createLinearGradient(0, -baseHalfWidth, needleLength, 0);
      topGrad.addColorStop(0, "#e2e8f0");
      topGrad.addColorStop(0.35, "#ffffff");
      topGrad.addColorStop(0.85, "#f8fafc");
      topGrad.addColorStop(1, "#ffffff");
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -baseHalfWidth);
      ctx.lineTo(needleLength, 0);
      ctx.closePath();
      ctx.fillStyle = topGrad;
      ctx.fill();

      const botGrad = ctx.createLinearGradient(0, baseHalfWidth, needleLength, 0);
      botGrad.addColorStop(0, "#64748b");
      botGrad.addColorStop(0.3, "#94a3b8");
      botGrad.addColorStop(0.85, "#cbd5e1");
      botGrad.addColorStop(1, "#f1f5f9");
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, baseHalfWidth);
      ctx.lineTo(needleLength, 0);
      ctx.closePath();
      ctx.fillStyle = botGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(hubRadius * 0.8, 0);
      ctx.lineTo(needleLength * 0.96, 0);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 4;
      const outerHubGrad = ctx.createLinearGradient(
        cx - hubRadius,
        cy - hubRadius,
        cx + hubRadius,
        cy + hubRadius
      );
      outerHubGrad.addColorStop(0, "#94a3b8");
      outerHubGrad.addColorStop(0.5, "#475569");
      outerHubGrad.addColorStop(1, "#1e293b");
      ctx.beginPath();
      ctx.arc(cx, cy, hubRadius, 0, Math.PI * 2);
      ctx.fillStyle = outerHubGrad;
      ctx.fill();
      ctx.restore();

      const innerRingR = hubRadius * 0.84;
      const innerHubGrad = ctx.createRadialGradient(
        cx - innerRingR * 0.28,
        cy - innerRingR * 0.28,
        innerRingR * 0.1,
        cx,
        cy,
        innerRingR
      );
      innerHubGrad.addColorStop(0, "#ffffff");
      innerHubGrad.addColorStop(0.55, "#e2e8f0");
      innerHubGrad.addColorStop(0.85, "#94a3b8");
      innerHubGrad.addColorStop(1, "#64748b");
      ctx.beginPath();
      ctx.arc(cx, cy, innerRingR, 0, Math.PI * 2);
      ctx.fillStyle = innerHubGrad;
      ctx.fill();

      const coreHoleR = hubRadius * 0.36;
      const coreGrad = ctx.createLinearGradient(
        cx,
        cy - coreHoleR,
        cx,
        cy + coreHoleR
      );
      coreGrad.addColorStop(0, "#090a0f");
      coreGrad.addColorStop(1, "#272a30");
      ctx.beginPath();
      ctx.arc(cx, cy, coreHoleR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();
    }

    function drawGauge() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Sizing matches the exact viewBox (480x340) of the original Turborepo gauge
      const cx = width * 0.5;
      const cy = height * 0.69;
      const radius = Math.min(width * 0.40, height * 0.56);

      const outerArcRadius = radius;
      const outerArcThickness = Math.max(8, radius * 0.058);
      const innerArcRadius = outerArcRadius - outerArcThickness * 0.5;
      const startRad = START_DEG * DEG_TO_RAD;
      const endRad = END_DEG * DEG_TO_RAD;

      const activeRatio = state.syncArcWithNeedle ? state.arcLitValue : 0.835;

      // Soft, subtle inner glow (toned down cleanly without heavy bloom)
      const glowSlices = 48;
      const glowInnerR = radius * 0.72;
      ctx.save();
      for (let i = 0; i < glowSlices; i++) {
        const t0 = i / glowSlices;
        const t1 = (i + 1) / glowSlices;
        if (t0 > activeRatio) break;
        const clampedT1 = Math.min(t1, activeRatio);
        const a0 = (START_DEG + TOTAL_SWEEP_DEG * t0) * DEG_TO_RAD;
        const a1 = (START_DEG + TOTAL_SWEEP_DEG * clampedT1) * DEG_TO_RAD + 0.008;
        const edgeFade = Math.min(1, t0 * 3);
        const grad = ctx.createRadialGradient(
          cx,
          cy,
          glowInnerR,
          cx,
          cy,
          outerArcRadius * 1.01
        );
        grad.addColorStop(0, getGaugeColorAt(t0, 0));
        grad.addColorStop(0.75, getGaugeColorAt(t0, 0.015 * edgeFade));
        grad.addColorStop(0.94, getGaugeColorAt(t0, 0.05 * edgeFade));
        grad.addColorStop(1, getGaugeColorAt(t0, 0));
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, outerArcRadius * 1.01, a0, a1);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }
      ctx.restore();

      // Base track arc (clean and dark, exactly like Turborepo dark theme)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, outerArcRadius, startRad, endRad);
      ctx.strokeStyle = "rgba(30, 41, 59, 0.5)";
      ctx.lineWidth = outerArcThickness;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, innerArcRadius, startRad, endRad);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Lit colored arc
      if (activeRatio > 0.002) {
        const litSlices = 70;

        // Micro-bloom layer (very soft)
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        for (let i = 0; i < litSlices; i++) {
          const t0 = (i / litSlices) * activeRatio;
          const t1 = ((i + 1) / litSlices) * activeRatio;
          const a0 = (START_DEG + TOTAL_SWEEP_DEG * t0) * DEG_TO_RAD;
          const a1 = (START_DEG + TOTAL_SWEEP_DEG * t1) * DEG_TO_RAD + 0.005;
          ctx.beginPath();
          ctx.arc(cx, cy, outerArcRadius, a0, a1);
          ctx.strokeStyle = getGaugeColorAt(t0, 0.12);
          ctx.lineWidth = outerArcThickness * 1.18;
          ctx.stroke();
        }
        ctx.restore();

        // Crisp solid core arc
        ctx.save();
        for (let i = 0; i < litSlices; i++) {
          const t0 = (i / litSlices) * activeRatio;
          const t1 = ((i + 1) / litSlices) * activeRatio;
          const a0 = (START_DEG + TOTAL_SWEEP_DEG * t0) * DEG_TO_RAD;
          const a1 = (START_DEG + TOTAL_SWEEP_DEG * t1) * DEG_TO_RAD + 0.004;
          ctx.beginPath();
          ctx.arc(cx, cy, outerArcRadius, a0, a1);
          ctx.strokeStyle = getGaugeColorAt(t0, 0.95);
          ctx.lineWidth = outerArcThickness;
          ctx.stroke();
        }
        ctx.restore();
      }

      const numSegments = 7;
      const subTicksPerSegment = 8;
      const totalTicks = numSegments * subTicksPerSegment;
      ctx.save();
      for (let i = 0; i <= totalTicks; i++) {
        const t = i / totalTicks;
        const angle = (START_DEG + TOTAL_SWEEP_DEG * t) * DEG_TO_RAD;
        const isSegmentBoundary = i % subTicksPerSegment === 0;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        if (isSegmentBoundary && i > 0 && i < totalTicks) {
          const divOuterR = outerArcRadius + outerArcThickness * 0.54;
          const divInnerR = innerArcRadius - radius * 0.075;
          ctx.beginPath();
          ctx.moveTo(cx + cosA * divInnerR, cy + sinA * divInnerR);
          ctx.lineTo(cx + cosA * divOuterR, cy + sinA * divOuterR);
          ctx.strokeStyle = "#07080a";
          ctx.lineWidth = Math.max(2, radius * 0.012);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(cx + cosA * divInnerR, cy + sinA * divInnerR);
          ctx.lineTo(
            cx + cosA * (innerArcRadius - 1),
            cy + sinA * (innerArcRadius - 1)
          );
          ctx.strokeStyle =
            t <= activeRatio ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)";
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (!isSegmentBoundary) {
          const tickOuterR = innerArcRadius - radius * 0.02;
          const tickInnerR = tickOuterR - radius * 0.034;
          ctx.beginPath();
          ctx.moveTo(cx + cosA * tickInnerR, cy + sinA * tickInnerR);
          ctx.lineTo(cx + cosA * tickOuterR, cy + sinA * tickOuterR);
          ctx.strokeStyle =
            t <= activeRatio ? "rgba(255, 255, 255, 0.42)" : "rgba(255, 255, 255, 0.16)";
          ctx.lineWidth = Math.max(1, radius * 0.005);
          ctx.lineCap = "round";
          ctx.stroke();
        }
      }
      ctx.restore();

      const bottomFade = ctx.createLinearGradient(
        0,
        cy + radius * 0.08,
        0,
        cy + radius * 0.36
      );
      bottomFade.addColorStop(0, "rgba(5, 5, 7, 0)");
      bottomFade.addColorStop(0.75, "rgba(5, 5, 7, 0)");
      bottomFade.addColorStop(1, "rgba(5, 5, 7, 0)");
      ctx.fillStyle = bottomFade;
      ctx.fillRect(0, cy + radius * 0.08, width, radius * 0.35);

      const needleAngleRad =
        (START_DEG + TOTAL_SWEEP_DEG * state.currentValue) * DEG_TO_RAD;
      drawMetallicNeedle(cx, cy, radius, needleAngleRad);
    }

    let animationId: number;
    let lastTime = performance.now();

    function animate(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      state.autoTime += dt;

      let desiredTarget: number;
      if (externalValue !== null && externalValue !== undefined) {
        desiredTarget = Math.max(0, Math.min(1, externalValue));
      } else {
        const wave1 = Math.sin(state.autoTime * 1.15) * 0.22;
        const wave2 = Math.sin(state.autoTime * 0.48 + 1.2) * 0.14;
        const wave3 = Math.cos(state.autoTime * 2.3) * 0.04;
        desiredTarget = 0.62 + wave1 + wave2 + wave3;
      }

      const flutterAmount = state.flutter * 0.012;
      const microFlutter =
        (Math.sin(state.autoTime * 14.5) * 0.6 +
          Math.cos(state.autoTime * 23.1) * 0.4) *
        flutterAmount;
      desiredTarget = Math.max(0, Math.min(1, desiredTarget + microFlutter));

      const stiffness = 18 + (1 - state.smoothness) * 140;
      const damping =
        2 * Math.sqrt(stiffness) * (0.72 + state.smoothness * 0.35);

      const force = (desiredTarget - state.currentValue) * stiffness;
      state.velocity += force * dt;
      state.velocity *= Math.exp(-damping * dt);
      state.currentValue += state.velocity * dt;

      if (state.currentValue < 0) {
        state.currentValue = 0;
        state.velocity *= -0.2;
      } else if (state.currentValue > 1) {
        state.currentValue = 1;
        state.velocity *= -0.2;
      }

      state.arcLitValue +=
        (state.currentValue - state.arcLitValue) * Math.min(1, dt * 16);

      drawGauge();
      animationId = requestAnimationFrame(animate);
    }

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [externalValue]);

  return (
    <div
      className={`relative flex items-center justify-center w-full max-w-[440px] sm:max-w-[480px] aspect-[24/17] ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none"
      />
    </div>
  );
}
