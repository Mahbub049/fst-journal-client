"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Stage = "ceremony" | "honouree" | "ready" | "launching" | "inaugurated" | "opening";
type CurtainPhase = "none" | "dimming" | "closed" | "opening" | "settling" | "open" | "exiting";

const HONOUREE_HOLD_MS = 5000;
const CURTAIN_FADE_MS = 1850;
const CURTAIN_SETTLE_MS = 700;
const CURTAIN_OPEN_MS = 7600;
const CURTAIN_FINISH_MS = 2100;
const CURTAIN_EXIT_MS = 900;
const REDIRECT_AFTER_MS = 14500;

const INAUGURATOR = {
  name: "Major General Md Mahbub-ul Alam",
  title: "BSP, ndc, afwc, psc, MPhil, PhD",
  role: "Vice Chancellor, Bangladesh University of Professionals (BUP)",
};


function smoothstep(edge0: number, edge1: number, value: number) {
  const x = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return x * x * (3 - 2 * x);
}

function CinematicTheatreCurtain({
  phase,
  openDuration,
}: {
  phase: CurtainPhase;
  openDuration: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const openingStartedAtRef = useRef<number | null>(null);
  const phaseRef = useRef<CurtainPhase>(phase);

  useEffect(() => {
    phaseRef.current = phase;
    if (phase === "opening" && openingStartedAtRef.current === null) {
      openingStartedAtRef.current = performance.now();
    }
    if (phase === "dimming" || phase === "closed") {
      progressRef.current = 0;
      openingStartedAtRef.current = null;
    }
    if (phase === "open" || phase === "exiting") {
      progressRef.current = 1;
    }
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });

    if (!gl) return;

    const vertexSource = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uProgress;
      uniform vec2 uResolution;

      const float PI = 3.141592653589793;

      float gauss(float x, float c, float s) {
        float z = (x - c) / s;
        return exp(-z * z);
      }

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      vec3 velvet(float localX, float y, float side, float motionAmount, float p) {
        float tieCompression = gauss(y, 0.54, 0.17);
        float foldCount = mix(7.4, 9.8 + 2.4 * tieCompression, p);

        float lowerWeight = smoothstep(0.34, 1.0, y);
        float upperWeight = 1.0 - smoothstep(0.0, 0.26, y);
        float fabricSway =
          0.18 * sin(y * 6.4 + uTime * 0.82 + side * 0.7) * motionAmount +
          0.07 * sin(y * 16.0 - uTime * 1.02 + side * 1.7) * motionAmount +
          (0.035 + 0.060 * lowerWeight) * sin(y * 4.8 - uTime * 1.16 + localX * 3.8) * motionAmount +
          (0.020 + 0.030 * upperWeight) * sin(y * 5.1 + uTime * 0.72 + localX * 2.8) * motionAmount;

        float gatherStrength = smoothstep(0.72, 1.0, p);
        float gathered = mix(localX, pow(localX, mix(1.0, 1.30 + 0.38 * tieCompression, gatherStrength)), 0.32 * gatherStrength);

        float phase = gathered * foldCount * 2.0 * PI + fabricSway;
        float fold = cos(phase);
        float crest = pow(max(fold, 0.0), 1.72);
        float valley = pow(max(-fold, 0.0), 1.25);

        float fine = 0.026 * sin(phase * 3.15 + y * 26.0);
        float lighting = clamp(0.23 + crest * 0.56 - valley * 0.09 + fine, 0.0, 1.0);

        // Slightly lighter maroon/burgundy for a richer, less dark curtain.
        vec3 shadow = vec3(0.165, 0.015, 0.034);
        vec3 midtone = vec3(0.545, 0.048, 0.102);
        vec3 highlight = vec3(0.820, 0.155, 0.205);

        vec3 color = mix(shadow, midtone, clamp(lighting * 1.22, 0.0, 1.0));
        color = mix(color, highlight, smoothstep(0.56, 0.96, lighting));

        float velvetSheen = pow(max(fold, 0.0), 8.0) * (0.055 + 0.06 * (1.0 - y));
        color += vec3(0.11, 0.018, 0.027) * velvetSheen;

        float grain = hash21(floor(gl_FragCoord.xy * 0.72));
        color *= 0.974 + grain * 0.052;

        // Slightly darker toward the outer edges and the floor.
        color *= 0.88 + 0.12 * sin(localX * PI);
        color *= mix(0.91, 1.0, smoothstep(0.0, 0.22, y));
        return color;
      }

      void main() {
        vec2 uv = vUv;
        float p = clamp(uProgress, 0.0, 1.0);

        // During most of the opening, the top/middle/bottom should all travel
        // outward together like a real theatre curtain. Only near the end does the
        // tie-back shape become more obvious.
        float earlyOpen = 0.106 +
          0.012 * gauss(uv.y, 0.90, 0.22) +
          0.010 * gauss(uv.y, 0.11, 0.20);

        float tiedShape =
          0.112 +
          0.064 * gauss(uv.y, 0.90, 0.21) -
          0.034 * gauss(uv.y, 0.54, 0.17) +
          0.054 * gauss(uv.y, 0.11, 0.18);

        float tiedShapeProgress = smoothstep(0.60, 0.94, p);
        float finalLeft = mix(earlyOpen, tiedShape, tiedShapeProgress);

        float travel = 1.0 - pow(1.0 - p, 3.05);
        float activeWave = pow(sin(p * PI), 1.12);
        float bottomWeight = smoothstep(0.28, 1.0, uv.y);
        float lowerFlow = smoothstep(0.50, 1.0, uv.y);
        float upperFlow = 1.0 - smoothstep(0.0, 0.28, uv.y);

        // Slow, natural cloth movement: gentle over most of the drape, and more
        // noticeable toward the lower half so the fabric can gather organically
        // into the tied position rather than feeling like a rigid panel.
        float edgeWave = activeWave * (
          (0.0032 + 0.0055 * bottomWeight + 0.0032 * upperFlow) * sin(uv.y * 8.0 + uTime * 1.24 + 0.15 * sin(uTime * 0.62)) +
          (0.0014 + 0.0028 * lowerFlow + 0.0014 * upperFlow) * sin(uv.y * 16.4 - uTime * 0.98 + 0.85) +
          (0.0008 + 0.0016 * lowerFlow) * sin(uv.y * 28.0 + uTime * 1.44 + p * 1.3)
        );

        // A tiny trailing delay down the curtain height avoids every vertical
        // section moving in lockstep and creates a more natural flowing edge.
        edgeWave += activeWave * (0.0016 + 0.0024 * lowerFlow + 0.0018 * upperFlow) *
          sin((uv.y * 5.8 - p * 4.0) * PI + uTime * (1.36 - 0.16 * uv.y));

        // Even before opening, keep a barely perceptible living movement.
        edgeWave += (1.0 - p) * (0.0010 + 0.0007 * bottomWeight + 0.0007 * upperFlow) *
          sin(uv.y * 8.4 + uTime * 0.54);

        float leftBoundary = mix(0.5, finalLeft, travel) + edgeWave;
        float rightBoundary = 1.0 - mix(0.5, finalLeft, travel) - edgeWave * 0.90;

        float px = 1.35 / max(uResolution.x, uResolution.y);
        float leftMask = 1.0 - smoothstep(leftBoundary - px, leftBoundary + px, uv.x);
        float rightMask = smoothstep(rightBoundary - px, rightBoundary + px, uv.x);

        float leftWidth = max(leftBoundary, 0.001);
        float rightWidth = max(1.0 - rightBoundary, 0.001);
        float leftLocal = clamp(uv.x / leftWidth, 0.0, 1.0);
        float rightLocal = clamp((1.0 - uv.x) / rightWidth, 0.0, 1.0);

        float clothMotion = 0.20 + activeWave * 0.80;
        vec3 leftColor = velvet(leftLocal, uv.y, -1.0, clothMotion, p);
        vec3 rightColor = velvet(rightLocal, uv.y, 1.0, clothMotion, p);

        vec3 color = leftColor * leftMask + rightColor * rightMask;
        float alpha = max(leftMask, rightMask);

        // Soft depth shadow just outside the moving inner edges.
        float leftOutside = smoothstep(leftBoundary, leftBoundary + 0.025, uv.x) *
                            (1.0 - smoothstep(leftBoundary + 0.025, leftBoundary + 0.060, uv.x));
        float rightOutside = (1.0 - smoothstep(rightBoundary - 0.025, rightBoundary, uv.x)) *
                             smoothstep(rightBoundary - 0.060, rightBoundary - 0.025, uv.x);
        float edgeShadow = (leftOutside + rightOutside) * 0.26 * smoothstep(0.03, 0.45, p);

        // The gold piping appears late in the pull, so there are no strange gold
        // vertical lines while the curtain is still closed at the centre.
        float trimVisibility = smoothstep(0.56, 0.84, p);
        float trimLeft = 1.0 - smoothstep(0.0015, 0.0045, abs(uv.x - leftBoundary));
        float trimRight = 1.0 - smoothstep(0.0015, 0.0045, abs(uv.x - rightBoundary));
        float trim = max(trimLeft, trimRight) * trimVisibility;
        vec3 gold = vec3(0.86, 0.61, 0.20);
        color = mix(color, gold, trim * 0.92);
        alpha = max(alpha, trim * 0.96);

        if (alpha < 0.002 && edgeShadow < 0.002) discard;

        if (alpha < 0.002) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, edgeShadow);
        } else {
          gl_FragColor = vec4(color, max(alpha, edgeShadow));
        }
      }
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Curtain shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Curtain shader link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const timeUniform = gl.getUniformLocation(program, "uTime");
    const progressUniform = gl.getUniformLocation(program, "uProgress");
    const resolutionUniform = gl.getUniformLocation(program, "uResolution");

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    let frame = 0;
    let mounted = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.45);
      const width = Math.max(1, Math.round(window.innerWidth * dpr));
      const height = Math.max(1, Math.round(window.innerHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
    };

    const render = (now: number) => {
      if (!mounted) return;
      resize();

      const currentPhase = phaseRef.current;
      if (
        (currentPhase === "opening" || currentPhase === "settling") &&
        openingStartedAtRef.current !== null
      ) {
        const raw = Math.min(1, Math.max(0, (now - openingStartedAtRef.current) / openDuration));
        // PowerPoint/theatre-like timing: deliberate start, strongest motion in the
        // middle, then a long soft settle without ever visibly stopping early.
        const eased = raw < 0.5
          ? 4.0 * raw * raw * raw
          : 1.0 - Math.pow(-2.0 * raw + 2.0, 3.0) / 2.0;
        progressRef.current = eased;
      } else if (currentPhase === "open" || currentPhase === "exiting") {
        progressRef.current = 1;
      }

      const progress = progressRef.current;
      const tieProgress = smoothstep(0.60, 0.93, progress);
      const tieOpacity = smoothstep(0.56, 0.78, progress);

      if (shellRef.current) {
        shellRef.current.style.setProperty("--tie-progress", String(tieProgress));
        shellRef.current.style.setProperty("--tie-opacity", String(tieOpacity));
      }

      canvas.style.opacity = "1";

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(timeUniform, now / 1000);
      gl.uniform1f(progressUniform, progress);
      gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      frame = window.requestAnimationFrame(render);
    };

    frame = window.requestAnimationFrame(render);
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      mounted = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      if (buffer) gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [openDuration]);

  const hidden = phase === "dimming";
  const exiting = phase === "exiting";

  return (
    <div
      ref={shellRef}
      className={`theatre-curtain-shell ${hidden ? "theatre-curtain-hidden" : ""} ${exiting ? "theatre-curtain-exiting" : ""}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="theatre-curtain-canvas" />

      <div className="theatre-tieback theatre-tieback-left" aria-hidden="true">
        <span className="theatre-tieback-rope" />
        <span className="theatre-tieback-knot" />
        <span className="theatre-tieback-tassel" />
      </div>
      <div className="theatre-tieback theatre-tieback-right" aria-hidden="true">
        <span className="theatre-tieback-rope" />
        <span className="theatre-tieback-knot" />
        <span className="theatre-tieback-tassel" />
      </div>

      <div className="theatre-top-rail">
        <span />
      </div>
      <div className="theatre-edge-vignette" />
    </div>
  );
}

export default function InaugurationPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("ceremony");
  const [curtainPhase, setCurtainPhase] = useState<CurtainPhase>("none");
  const [countdown, setCountdown] = useState(5);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  };

  const clearCurtainAnimations = () => {
    // The WebGL curtain owns its requestAnimationFrame lifecycle and cleans up on unmount.
  };

  useEffect(() => {
    return () => {
      clearTimers();
      clearCurtainAnimations();
    };
  }, []);

  useEffect(() => {
    if (stage !== "opening") return;

    setCountdown(5);

    const interval = window.setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [stage]);

  const ambientDots = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        left: `${6 + ((index * 31) % 88)}%`,
        top: `${9 + ((index * 47) % 78)}%`,
        delay: `${((index * 17) % 28) / 10}s`,
        duration: `${5.5 + ((index * 13) % 24) / 10}s`,
        size: 2 + (index % 3),
      })),
    [],
  );

  const orbitDots = useMemo(
    () =>
      Array.from({ length: 9 }, (_, index) => ({
        id: index,
        angle: `${index * 40}deg`,
        delay: `${index * -0.6}s`,
      })),
    [],
  );

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 92 }, (_, index) => {
        const angle = (index / 92) * Math.PI * 2;
        const radius = 230 + ((index * 47) % 320);

        return {
          id: index,
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          delay: ((index * 17) % 36) / 100,
          duration: 1.45 + ((index * 11) % 12) / 10,
          rotate: (index * 53) % 360,
        };
      }),
    [],
  );

  const beginInauguration = () => {
    if (stage !== "ceremony") return;

    clearTimers();
    clearCurtainAnimations();

    // Cross-fade directly from the inauguration screen into the closed curtain.
    // The first mounted curtain frame is transparent; a short moment later the
    // "closed" state is applied, so the red velvet fades in instead of the
    // screen snapping to black.  Only after the curtain fully covers the screen
    // do we swap the hidden slide to the honouree and begin the centre split.
    setCurtainPhase("dimming");

    const curtainFadeStartsAt = 120;
    const curtainFullyClosedAt = curtainFadeStartsAt + CURTAIN_FADE_MS;
    const curtainOpeningAt = curtainFullyClosedAt + CURTAIN_SETTLE_MS;
    const curtainOpenAt = curtainOpeningAt + CURTAIN_OPEN_MS;
    const curtainSettlingAt = curtainOpenAt - CURTAIN_FINISH_MS;

    timers.current.push(
      // Trigger the visible cross-fade after the transparent overlay has mounted.
      window.setTimeout(() => setCurtainPhase("closed"), curtainFadeStartsAt),
      // Swap the content beneath only while it is fully hidden by the curtain.
      window.setTimeout(
        () => setStage("honouree"),
        curtainFullyClosedAt + 60,
      ),
      // Pull the two curtain halves away from the centre toward opposite sides.
      // The WAAPI motion starts one frame after the opening class is applied so
      // the browser always paints the fully closed starting frame first.
      window.setTimeout(() => {
        setCurtainPhase("opening");
      }, curtainOpeningAt),
      // During the final part of the travel, cross-fade the same moving velvet
      // into the dressed theatre frame.  This prevents the final side-curtain
      // design from appearing as a sudden second scene.
      window.setTimeout(() => setCurtainPhase("settling"), curtainSettlingAt),
      // Finish in the fully dressed side-curtain state.
      window.setTimeout(() => setCurtainPhase("open"), curtainOpenAt),
      // Five seconds AFTER the curtain is completely open, reveal the existing Launch Now
      // screen underneath and fade the theatre curtain away instead of cutting it off.
      window.setTimeout(
        () => {
          setStage("ready");
          setCurtainPhase("exiting");
          timers.current.push(
            window.setTimeout(() => setCurtainPhase("none"), CURTAIN_EXIT_MS),
          );
        },
        curtainOpenAt + HONOUREE_HOLD_MS,
      ),
    );
  };

  const inaugurate = () => {
    if (stage !== "ready") return;

    clearTimers();
    setStage("launching");

    timers.current.push(
      window.setTimeout(() => setStage("inaugurated"), 4000),
      window.setTimeout(() => setStage("opening"), 8500),
      window.setTimeout(() => router.push("/"), REDIRECT_AFTER_MS),
    );
  };

  const isCelebrating = stage === "inaugurated" || stage === "opening";
  const isInMotion = stage !== "ready";

  return (
    <main
      className={[
        "relative min-h-screen overflow-hidden bg-[#041827] text-white selection:bg-[#d8b55b] selection:text-[#041827]",
        isInMotion ? "launch-active" : "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(23,126,154,0.17),transparent_33%),radial-gradient(circle_at_88%_80%,rgba(211,177,84,0.13),transparent_30%)]" />

        <div className="absolute left-1/2 top-[47%] h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.025] animate-[slowSpin_32s_linear_infinite]" />
        <div className="absolute left-1/2 top-[47%] h-[590px] w-[590px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#6dd6ec]/[0.055] animate-[reverseSpin_24s_linear_infinite]" />
        <div className="absolute left-1/2 top-[47%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045]" />

        <div className="absolute left-1/2 top-[47%] h-[700px] w-[2px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-[#72d9ee]/10 to-transparent blur-[1px] animate-[beamPulse_4.8s_ease-in-out_infinite]" />
        <div className="absolute left-1/2 top-[47%] h-[2px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#d8b55b]/10 to-transparent blur-[1px] animate-[beamPulse_5.4s_ease-in-out_infinite]" />

        {ambientDots.map((dot) => (
          <span
            key={dot.id}
            className="absolute rounded-full bg-white/25 shadow-[0_0_14px_rgba(120,217,237,0.35)] animate-[ambientDrift_ease-in-out_infinite]"
            style={{
              left: dot.left,
              top: dot.top,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              animationDelay: dot.delay,
              animationDuration: dot.duration,
            }}
          />
        ))}

        <div className="absolute -left-24 top-[18%] h-[1px] w-[460px] rotate-[18deg] bg-gradient-to-r from-transparent via-[#72d9ee]/10 to-transparent animate-[scanLine_7s_ease-in-out_infinite]" />
        <div className="absolute -right-28 bottom-[25%] h-[1px] w-[520px] -rotate-[20deg] bg-gradient-to-r from-transparent via-[#d8b55b]/10 to-transparent animate-[scanLineReverse_8s_ease-in-out_infinite]" />

        <svg
          className="absolute inset-0 h-full w-full opacity-[0.16]"
          viewBox="0 0 1600 900"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M-90 740C281 530 472 611 746 670C1042 734 1272 627 1691 414"
            stroke="rgba(120,217,237,0.58)"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <path
            d="M-90 787C281 577 472 658 746 717C1042 781 1272 674 1691 461"
            stroke="rgba(255,255,255,0.36)"
            strokeWidth="0.95"
            strokeLinecap="round"
          />
          <path
            d="M-80 835C260 640 485 695 763 747C1092 809 1345 686 1700 514"
            stroke="rgba(216,181,91,0.44)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="mx-auto flex w-full max-w-[1480px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-full bg-white p-1 shadow-[0_10px_30px_rgba(0,0,0,0.18)] animate-[logoFloat_5s_ease-in-out_infinite] sm:h-12 sm:w-12">
              <Image
                src="/images/bup.png"
                alt="Bangladesh University of Professionals"
                width={48}
                height={48}
                className="h-full w-full object-contain p-1"
                priority
              />
            </div>

            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#8be4f4] sm:text-sm">
                Bangladesh University of Professionals (BUP)
              </p>
            </div>
          </div>

          <div className="relative hidden items-center gap-2.5 overflow-hidden rounded-full border border-[#6ed6ea]/30 bg-[#071f34]/80 px-4 py-2 shadow-[0_14px_45px_rgba(11,105,135,0.20)] backdrop-blur-xl sm:flex">
            <span className="pointer-events-none absolute inset-y-0 -left-16 w-12 rotate-12 bg-white/10 blur-md animate-[badgeSweep_5.5s_ease-in-out_infinite]" />
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[#72d9ee]/30 bg-[#0b5d78]/55">
              <span className="h-2.5 w-2.5 rounded-full bg-[#79e0f2] shadow-[0_0_14px_rgba(121,224,242,.75)] animate-[statusDot_2.2s_ease-in-out_infinite]" />
            </span>
            <div className="relative flex items-center gap-3">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white sm:text-sm">
                Digital Inauguration
              </span>
              <span className="h-5 w-px bg-white/15" />
              <span className="rounded-full border border-[#d8b55b]/35 bg-[#d8b55b]/10 px-2.5 py-1 text-[10px] font-black tracking-[0.14em] text-[#f4d878] sm:text-[11px]">
                2026
              </span>
            </div>
          </div>
        </header>

        <section className="flex flex-1 items-center justify-center px-5 pb-16 pt-6 sm:px-8">
          <div className="relative mx-auto w-full max-w-6xl text-center">
            <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center sm:h-44 sm:w-44">
              <div
                className={[
                  "absolute inset-0 rounded-full border border-[#6dd6ec]/25 transition-all duration-1000",
                  stage === "launching" ? "scale-[1.7] opacity-0" : "opacity-100",
                  isCelebrating ? "scale-[1.18] border-[#d8b55b]/35" : "",
                ].join(" ")}
              />

              <div className="absolute inset-[11px] rounded-full border border-white/[0.08] animate-[reverseSpin_13s_linear_infinite]" />

              {orbitDots.map((dot) => (
                <span
                  key={dot.id}
                  className="absolute left-1/2 top-1/2 h-[5px] w-[5px] rounded-full bg-[#7ee0f3] shadow-[0_0_10px_rgba(126,224,243,.85)] animate-[orbitDot_8s_linear_infinite]"
                  style={
                    {
                      "--angle": dot.angle,
                      animationDelay: dot.delay,
                    } as React.CSSProperties
                  }
                />
              ))}

              <div
                className={[
                  "relative h-32 w-32 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white shadow-[0_22px_68px_rgba(0,0,0,0.26)] transition-all duration-700 sm:h-36 sm:w-36",
                  stage === "launching"
                    ? "scale-110 shadow-[0_0_80px_rgba(120,217,237,0.25)]"
                    : "animate-[logoFloat_5s_ease-in-out_infinite]",
                  isCelebrating
                    ? "shadow-[0_0_90px_rgba(216,181,91,0.28)]"
                    : "",
                ].join(" ")}
              >
                <img
                  src="/images/journal-of-fst-logo.svg"
                  alt="Journal of FST"
                  className="h-full w-full object-contain p-0.5"
                />
              </div>

              {stage === "launching" && (
                <>
                  <span className="absolute inset-[-35px] rounded-full border border-[#78d9ed]/35 animate-[launchRing_1.4s_ease-out_infinite]" />
                  <span className="absolute inset-[-70px] rounded-full border border-[#d8b55b]/20 animate-[launchRing_1.4s_ease-out_.35s_infinite]" />
                  <span className="absolute inset-[-105px] rounded-full border border-white/10 animate-[launchRing_1.4s_ease-out_.7s_infinite]" />
                </>
              )}
            </div>

            {stage === "ceremony" && (
              <div className="animate-[stageIn_.7s_ease-out_both]">
                <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#6fd7eb]/20 bg-[#0a2940]/55 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#8be4f4] shadow-[0_12px_42px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-[#d8b55b] shadow-[0_0_13px_rgba(216,181,91,.75)] animate-[statusDot_2.1s_ease-in-out_infinite]" />
                  Official Inauguration Ceremony
                </div>

                <p className="font-serif text-[clamp(1.35rem,2vw,2rem)] font-semibold tracking-[0.08em] text-[#e0b955]">
                  Bangladesh University of Professionals
                </p>

                <h1 className="mx-auto mt-5 max-w-5xl font-serif text-[clamp(3rem,6.2vw,6.7rem)] font-semibold leading-[0.94] tracking-[-0.035em] text-white">
                  Journal of FST
                </h1>

                <div className="mx-auto mt-6 flex max-w-2xl items-center justify-center gap-4 text-[#7fdaec]/75">
                  <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#78d9ed]/45 sm:w-24" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] sm:text-xs">
                    Faculty of Science &amp; Technology
                  </span>
                  <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#78d9ed]/45 sm:w-24" />
                </div>

                <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/50 sm:text-lg">
                  Mark the official beginning of the Journal of FST digital platform.
                </p>

                <div className="relative mt-11 inline-flex">
                  <span className="pointer-events-none absolute inset-[-18px] rounded-[30px] border border-[#d8b55b]/14 animate-[inaugurateHalo_2.6s_ease-in-out_infinite]" />
                  <span className="pointer-events-none absolute inset-[-36px] rounded-[42px] border border-[#78d9ed]/8 animate-[inaugurateHalo_2.6s_ease-in-out_.5s_infinite]" />
                  <button
                    type="button"
                    onClick={beginInauguration}
                    className="group relative inline-flex min-w-[320px] items-center justify-center gap-4 overflow-hidden rounded-[22px] border border-[#f3d47e]/55 bg-gradient-to-r from-[#e5bd58] via-[#dfb553] to-[#cfa147] px-9 py-5 text-[#061827] shadow-[0_25px_85px_rgba(216,181,91,0.24)] transition duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[#d8b55b]/20 sm:min-w-[390px] sm:px-12 sm:py-6 animate-[buttonBreathe_2.8s_ease-in-out_infinite]"
                  >
                    <span className="absolute inset-y-0 -left-20 w-14 rotate-12 bg-white/20 blur-md animate-[buttonSweep_3.5s_ease-in-out_infinite]" />
                    <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#061827]/15 bg-[#061827]/8 shadow-[inset_0_1px_0_rgba(255,255,255,.2)]">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <span className="relative font-serif text-[clamp(1.35rem,1.7vw,1.65rem)] font-semibold tracking-[0.02em]">
                      Inaugurate
                    </span>
                    <span className="relative h-2.5 w-2.5 rounded-full bg-[#0b5d78] shadow-[0_0_12px_rgba(11,93,120,.48)] transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            )}

            {stage === "honouree" && (
              <div className="honouree-scene animate-[stageIn_.9s_ease-out_both]">
                <div className="honouree-spotlight" aria-hidden="true" />
                <div className="honouree-sparkles" aria-hidden="true">
                  {Array.from({ length: 18 }, (_, index) => (
                    <span
                      key={index}
                      style={{
                        left: `${7 + ((index * 37) % 86)}%`,
                        top: `${8 + ((index * 53) % 66)}%`,
                        animationDelay: `${index * -0.17}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10 mx-auto max-w-5xl px-4">
                  <div className="mx-auto flex items-center justify-center gap-5 sm:gap-7">
                    <span className="h-px w-20 bg-gradient-to-r from-transparent to-[#d8b55b]/80 sm:w-40" />
                    <span className="text-[#d8b55b] text-xl sm:text-2xl">✦</span>
                    <span className="h-px w-20 bg-gradient-to-l from-transparent to-[#d8b55b]/80 sm:w-40" />
                  </div>

                  <h2 className="mt-3 font-serif text-[clamp(2.2rem,4.2vw,4.5rem)] font-semibold leading-none tracking-[-0.02em] text-[#e1b84f] [text-shadow:0_8px_30px_rgba(216,181,91,.14)]">
                    Inaugurated By
                  </h2>

                  <div className="mx-auto mt-5 h-px max-w-3xl bg-gradient-to-r from-transparent via-[#d8b55b]/60 to-transparent" />

                  <p className="mx-auto mt-7 max-w-5xl font-serif text-[clamp(2.35rem,4.8vw,5.35rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-white [text-shadow:0_8px_40px_rgba(0,0,0,.38)]">
                    {INAUGURATOR.name}
                  </p>

                  <p className="mx-auto mt-4 max-w-3xl text-[clamp(.86rem,1.35vw,1.22rem)] font-extrabold tracking-[0.07em] text-[#e4b94e]">
                    {INAUGURATOR.title}
                  </p>

                  <p className="mx-auto mt-4 max-w-4xl font-serif text-[clamp(1.05rem,1.8vw,1.65rem)] leading-relaxed text-white/88">
                    {INAUGURATOR.role}
                  </p>

                  <div className="mx-auto mt-7 flex items-center justify-center gap-4 text-[#d8b55b]">
                    <span className="h-px w-24 bg-gradient-to-r from-transparent to-[#d8b55b]/75 sm:w-44" />
                    <span className="text-lg">◇</span>
                    <span className="h-px w-24 bg-gradient-to-l from-transparent to-[#d8b55b]/75 sm:w-44" />
                  </div>
                </div>

                <div className="honouree-floor" aria-hidden="true">
                  <span className="honouree-floor-ring honouree-floor-ring-one" />
                  <span className="honouree-floor-ring honouree-floor-ring-two" />
                  <span className="honouree-floor-glow" />
                </div>
              </div>
            )}

            {stage === "ready" && (
              <div className="animate-[stageIn_.7s_ease-out_both]">
                <p className="font-serif text-[clamp(1.6rem,2.65vw,2.85rem)] font-semibold leading-none tracking-[0.05em] text-[#e0b955] animate-[softGlow_3s_ease-in-out_infinite]">
                  Ceremonial Launch
                </p>

                <h1 className="mx-auto mt-4 max-w-5xl font-serif text-[clamp(3.2rem,7vw,7.6rem)] font-semibold leading-[0.92] tracking-[-0.03em] text-white">
                  Journal of FST
                </h1>

                <p className="mx-auto mt-5 max-w-2xl text-sm font-semibold uppercase tracking-[0.2em] text-[#86dff0] sm:text-base">
                  Faculty of Science &amp; Technology
                </p>

                <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/55 sm:text-lg">
                  A renewed digital platform for research, innovation, and explore.
                </p>

                <div className="mt-11">
                  <button
                    type="button"
                    onClick={inaugurate}
                    className="group relative inline-flex min-w-[340px] items-center justify-center gap-4 overflow-hidden rounded-[22px] border border-[#f2cf73]/45 bg-gradient-to-r from-[#e5bd58] via-[#dcb354] to-[#d2a647] px-10 py-5 text-[clamp(1.2rem,1.55vw,1.45rem)] font-semibold tracking-[0.015em] text-[#061827] shadow-[0_24px_72px_rgba(216,181,91,0.24)] transition duration-300 hover:-translate-y-1 hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[#d8b55b]/18 sm:min-w-[395px] sm:px-12 sm:py-5.5 animate-[buttonBreathe_2.8s_ease-in-out_infinite]"
                  >
                    <span className="absolute inset-y-0 -left-20 w-12 rotate-12 bg-white/16 blur-md transition-all duration-700 group-hover:left-[120%] animate-[buttonSweep_3.8s_ease-in-out_infinite]" />
                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#061827]/15 bg-[#061827]/8 text-[#061827] shadow-[0_0_20px_rgba(255,255,255,0.16)]">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <span className="relative font-serif text-[1.2em] tracking-[0.01em]">Launch Now</span>
                    <span className="relative h-2.5 w-2.5 rounded-full bg-[#0b5d78] shadow-[0_0_10px_rgba(11,93,120,.45)] transition group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            )}

            {stage === "launching" && (
              <div className="animate-[stageIn_.55s_ease-out_both]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center">
                  <span className="absolute h-12 w-12 rounded-full border border-[#78d9ed]/25 animate-ping [animation-duration:1.25s]" />
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#d8b55b]" />
                </div>

                <h2 className="mx-auto mt-8 max-w-4xl font-serif text-[clamp(2.7rem,5vw,5.4rem)] font-semibold leading-[0.98] tracking-[-0.025em] text-white">
                  Opening a New Chapter
                </h2>

                <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/45">
                  Journal of FST · BUP
                </p>

                <div className="mx-auto mt-8 h-1 w-64 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#78d9ed] to-transparent animate-[loaderSweep_1.2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}

            {stage === "inaugurated" && (
              <div className="animate-[stageIn_.7s_ease-out_both]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/25 bg-emerald-300/10 text-emerald-200 shadow-[0_0_70px_rgba(110,231,183,0.16)] animate-[successPulse_2s_ease-in-out_infinite]">
                  <Check className="h-8 w-8" strokeWidth={2.5} />
                </div>

                <p className="mt-7 text-[11px] font-black uppercase tracking-[0.32em] text-[#d8b55b]">
                  Officially Inaugurated
                </p>

                <div className="mx-auto mt-5 flex max-w-5xl flex-col items-center">
                  <h2 className="font-serif text-[clamp(2.9rem,5.6vw,6.1rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-white">
                    The Journal of FST is
                  </h2>

                  <div className="relative mt-6 flex min-h-[150px] items-center justify-center px-8 sm:min-h-[180px]">
                    <span className="pointer-events-none absolute left-1/2 top-1/2 h-[128px] w-[128px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#78d9ed]/18 animate-[liveOrbit_5.5s_linear_infinite] sm:h-[158px] sm:w-[158px]" />
                    <span className="pointer-events-none absolute left-1/2 top-1/2 h-[185px] w-[185px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d8b55b]/10 animate-[liveOrbitReverse_7.5s_linear_infinite] sm:h-[225px] sm:w-[225px]" />
                    <span className="pointer-events-none absolute left-1/2 top-1/2 h-[2px] w-[125%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#78d9ed]/18 to-transparent animate-[liveBeam_2.8s_ease-in-out_infinite]" />

                    <div className="relative overflow-hidden rounded-[30px] border border-[#78d9ed]/30 bg-gradient-to-r from-[#082b43]/72 via-[#0a4058]/78 to-[#102c53]/72 px-8 py-5 shadow-[0_0_75px_rgba(120,217,237,0.16),inset_0_0_32px_rgba(120,217,237,0.035)] backdrop-blur-xl sm:px-14 sm:py-6">
                      <span className="absolute inset-y-0 -left-24 w-20 rotate-12 bg-white/10 blur-xl animate-[liveSweep_3.4s_ease-in-out_infinite]" />
                      <span className="absolute right-5 top-5 h-2 w-2 rounded-full bg-[#78d9ed] shadow-[0_0_12px_rgba(120,217,237,.85)] animate-[statusDot_1.8s_ease-in-out_infinite]" />

                      <div className="relative flex items-center justify-center gap-5 sm:gap-7">
                        <span className="font-serif text-[clamp(3rem,6vw,6.5rem)] font-semibold leading-none tracking-[-0.025em] text-white animate-[liveTextGlow_2.4s_ease-in-out_infinite]">
                          Now Live
                        </span>

                        <span
                          className="relative flex h-12 w-12 shrink-0 translate-y-[5px] items-center justify-center sm:h-14 sm:w-14 sm:translate-y-[7px]"
                          aria-hidden="true"
                        >
                          <span className="absolute inset-0 rounded-full border border-[#ff7b84]/35 bg-[#ff5d67]/8 animate-[liveBeaconOuter_2.2s_ease-out_infinite]" />
                          <span className="absolute inset-[7px] rounded-full border border-[#ff9da4]/45 bg-[#ff5d67]/12 animate-[liveBeaconMiddle_1.75s_ease-in-out_infinite]" />
                          <span className="absolute inset-[14px] rounded-full bg-[#ff5d67]/18 shadow-[0_0_26px_rgba(255,93,103,.42)]" />
                          <span className="relative h-4 w-4 rounded-full bg-[#ff5d67] shadow-[0_0_20px_rgba(255,93,103,1),0_0_40px_rgba(255,93,103,.42)]">
                            <span className="absolute inset-[-6px] animate-ping rounded-full border border-[#ff9da4]/45 [animation-duration:1.35s]" />
                          </span>
                        </span>
                      </div>

                      <span className="relative mx-auto mt-4 block h-[3px] w-36 overflow-hidden rounded-full bg-white/8">
                        <span className="block h-full w-1/2 rounded-full bg-gradient-to-r from-[#78d9ed] via-white to-[#d8b55b] animate-[liveLine_2.6s_ease-in-out_infinite]" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stage === "opening" && (
              <div className="animate-[stageIn_.55s_ease-out_both]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d8b55b]/30 bg-[#d8b55b]/10 text-[#f2d887] animate-[successPulse_1.8s_ease-in-out_infinite]">
                  <Sparkles className="h-6 w-6" />
                </div>

                <h2 className="mx-auto mt-7 max-w-4xl font-serif text-[clamp(2.8rem,5vw,5.4rem)] font-semibold leading-[0.96] tracking-[-0.03em] text-white">
                  Welcome to the Journal
                </h2>

                <p className="mt-6 text-base font-semibold text-white/55">
                  Opening the website in {countdown}...
                </p>

                <div className="mx-auto mt-7 h-1 w-56 overflow-hidden rounded-full bg-white/10 sm:w-72">
                  <div className="h-full origin-left animate-[openingBar_5.6s_linear_forwards] rounded-full bg-gradient-to-r from-[#78d9ed] to-[#d8b55b]" />
                </div>
              </div>
            )}

            {isCelebrating && (
              <div className="pointer-events-none absolute left-1/2 top-[38%] h-1 w-1 -translate-x-1/2 -translate-y-1/2">
                {confettiPieces.map((piece) => (
                  <span
                    key={piece.id}
                    className={[
                      "absolute left-0 top-0 rounded-[1px]",
                      piece.id % 5 === 0 ? "h-3 w-1 bg-[#d8b55b]" : "",
                      piece.id % 5 === 1 ? "h-2 w-2 rounded-full bg-[#78d9ed]" : "",
                      piece.id % 5 === 2 ? "h-3 w-1 bg-white" : "",
                      piece.id % 5 === 3 ? "h-2.5 w-1.5 bg-[#e7afca]" : "",
                      piece.id % 5 === 4 ? "h-2 w-2 rotate-45 bg-[#9be7c4]" : "",
                    ].join(" ")}
                    style={
                      {
                        "--tx": `${piece.x}px`,
                        "--ty": `${piece.y}px`,
                        "--rot": `${piece.rotate}deg`,
                        animation: `ceremonyBurst ${piece.duration}s cubic-bezier(.16,.72,.26,1) ${piece.delay}s both`,
                      } as React.CSSProperties
                    }
                  />
                ))}

                <span className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d8b55b]/20 animate-[celebrationWave_2.4s_ease-out_infinite]" />
                <span className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#78d9ed]/15 animate-[celebrationWave_2.4s_ease-out_.8s_infinite]" />
              </div>
            )}
          </div>
        </section>

      </div>

      {curtainPhase !== "none" && (
        <CinematicTheatreCurtain
          phase={curtainPhase}
          openDuration={CURTAIN_OPEN_MS}
        />
      )}

      <style jsx global>{`
        @keyframes statusDot {
          0%, 100% { opacity: 0.45; transform: scale(0.82); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        @keyframes liveOrbit {
          from { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
          50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.06); }
          to { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
        }

        @keyframes liveOrbitReverse {
          from { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
          50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.05); }
          to { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
        }

        @keyframes liveBeam {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scaleX(0.76); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scaleX(1.06); }
        }

        @keyframes liveSweep {
          0%, 50% { left: -6rem; opacity: 0; }
          60% { opacity: 0.8; }
          82% { left: 120%; opacity: 0; }
          100% { left: 120%; opacity: 0; }
        }

        @keyframes liveBeaconOuter {
          0% {
            transform: scale(0.78);
            opacity: 0.9;
          }
          72% {
            opacity: 0.22;
          }
          100% {
            transform: scale(1.28);
            opacity: 0;
          }
        }

        @keyframes liveBeaconMiddle {
          0%,
          100% {
            transform: scale(0.92);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        @keyframes liveTextGlow {
          0%, 100% {
            text-shadow: 0 0 0 rgba(120,217,237,0);
            transform: scale(1);
          }
          50% {
            text-shadow: 0 0 30px rgba(120,217,237,0.18);
            transform: scale(1.018);
          }
        }

        @keyframes liveLine {
          0%, 100% { transform: translateX(-70%); opacity: 0.55; }
          50% { transform: translateX(150%); opacity: 1; }
        }

        @keyframes stageIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
            filter: blur(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes logoFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes slowSpin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes reverseSpin {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes orbitDot {
          from {
            transform: rotate(var(--angle)) translateX(88px) rotate(calc(var(--angle) * -1));
            opacity: 0.25;
          }
          50% {
            opacity: 0.9;
          }
          to {
            transform: rotate(calc(var(--angle) + 360deg)) translateX(88px)
              rotate(calc((var(--angle) + 360deg) * -1));
            opacity: 0.25;
          }
        }

        @keyframes ambientDrift {
          0%,
          100% {
            opacity: 0.12;
            transform: translate3d(0, 0, 0) scale(0.85);
          }
          50% {
            opacity: 0.5;
            transform: translate3d(0, -15px, 0) scale(1.15);
          }
        }

        @keyframes softGlow {
          0%,
          100% {
            text-shadow: 0 0 0 rgba(216, 181, 91, 0);
          }
          50% {
            text-shadow: 0 0 18px rgba(216, 181, 91, 0.22);
          }
        }

        @keyframes beamPulse {
          0%,
          100% {
            opacity: 0.2;
            transform: translate(-50%, -50%) scaleY(0.8);
          }
          50% {
            opacity: 0.75;
            transform: translate(-50%, -50%) scaleY(1.08);
          }
        }

        @keyframes scanLine {
          0%,
          100% {
            transform: translateX(-22%) rotate(18deg);
            opacity: 0;
          }
          50% {
            transform: translateX(80%) rotate(18deg);
            opacity: 0.55;
          }
        }

        @keyframes scanLineReverse {
          0%,
          100% {
            transform: translateX(18%) rotate(-20deg);
            opacity: 0;
          }
          50% {
            transform: translateX(-78%) rotate(-20deg);
            opacity: 0.45;
          }
        }

        @keyframes buttonBreathe {
          0%,
          100% {
            box-shadow: 0 22px 65px rgba(216, 181, 91, 0.18);
          }
          50% {
            box-shadow:
              0 24px 75px rgba(216, 181, 91, 0.28),
              0 0 0 7px rgba(216, 181, 91, 0.045);
          }
        }

        @keyframes buttonSweep {
          0%,
          58% {
            left: -5rem;
            opacity: 0;
          }
          66% {
            opacity: 0.65;
          }
          84% {
            left: 120%;
            opacity: 0;
          }
          100% {
            left: 120%;
            opacity: 0;
          }
        }

        @keyframes launchRing {
          from {
            opacity: 0.7;
            transform: scale(0.55);
          }
          to {
            opacity: 0;
            transform: scale(1.45);
          }
        }

        @keyframes loaderSweep {
          0% {
            transform: translateX(-130%);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translateX(400%);
            opacity: 0;
          }
        }

        @keyframes successPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }

        @keyframes liveBadgeFloat {
          0%,
          100% {
            transform: translateY(0);
            box-shadow: 0 0 42px rgba(120, 217, 237, 0.12);
          }
          50% {
            transform: translateY(-4px);
            box-shadow: 0 0 62px rgba(120, 217, 237, 0.24);
          }
        }

        @keyframes ceremonyBurst {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.2) rotate(0deg);
          }
          10% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(
                calc(-50% + var(--tx)),
                calc(-50% + var(--ty))
              )
              scale(1) rotate(var(--rot));
          }
        }

        @keyframes celebrationWave {
          0% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(0.25);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(3.1);
          }
        }

        @keyframes openingBar {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        @keyframes badgeSweep {
          0%,
          62% {
            left: -4rem;
            opacity: 0;
          }
          70% {
            opacity: 0.75;
          }
          88% {
            left: 115%;
            opacity: 0;
          }
          100% {
            left: 115%;
            opacity: 0;
          }
        }

        .launch-active::after {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 4;
          background:
            radial-gradient(circle at 50% 45%, rgba(126, 224, 243, 0.09), transparent 27%),
            linear-gradient(120deg, transparent 35%, rgba(255, 255, 255, 0.025) 50%, transparent 65%);
          animation: launchAtmosphere 2.8s ease-in-out infinite;
        }

        @keyframes launchAtmosphere {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes inaugurateHalo {
          0%, 100% { opacity: 0.28; transform: scale(0.98); }
          50% { opacity: 0.85; transform: scale(1.035); }
        }

        @keyframes honoureeLine {
          0%, 100% { transform: translateX(-90%); opacity: 0.25; }
          50% { transform: translateX(190%); opacity: 1; }
        }

        /* ===== Rebuilt WebGL theatre curtain ===== */
        .theatre-curtain-shell {
          --tie-progress: 0;
          --tie-opacity: 0;
          position: fixed;
          inset: 0;
          z-index: 1000;
          overflow: hidden;
          pointer-events: none;
          opacity: 1;
          transition: opacity ${CURTAIN_FADE_MS}ms cubic-bezier(.22,.72,.20,1);
          isolation: isolate;
          background: transparent;
        }

        .theatre-curtain-hidden {
          opacity: 0;
        }

        .theatre-curtain-exiting {
          opacity: 0;
          transition-duration: ${CURTAIN_EXIT_MS}ms;
          transition-timing-function: cubic-bezier(.32,.02,.26,1);
        }

        .theatre-curtain-canvas {
          position: absolute;
          inset: 0;
          z-index: 10;
          width: 100%;
          height: 100%;
          display: block;
          pointer-events: none;
          will-change: opacity;
          transform: translateZ(0);
        }

        .theatre-top-rail {
          position: absolute;
          z-index: 40;
          top: 0;
          left: 0;
          right: 0;
          height: 16px;
          background:
            linear-gradient(180deg,
              #3c2004 0%,
              #a87523 12%,
              #f4d781 32%,
              #c39336 52%,
              #6f4210 72%,
              #d7ad4b 88%,
              #4a2806 100%);
          box-shadow:
            0 5px 18px rgba(0,0,0,.52),
            inset 0 1px 0 rgba(255,246,199,.95),
            inset 0 -1px 0 rgba(39,20,2,.72);
          transform: translateZ(0);
        }

        .theatre-top-rail > span {
          position: absolute;
          left: 5%;
          right: 5%;
          top: 2px;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, rgba(255,246,205,.96), transparent);
          filter: blur(.2px);
          opacity: .82;
        }

        .theatre-tieback {
          position: absolute;
          z-index: 32;
          top: 52%;
          width: 188px;
          height: 118px;
          pointer-events: none;
          opacity: var(--tie-opacity);
          will-change: transform, opacity;
          filter: drop-shadow(0 8px 16px rgba(0,0,0,.34));
          transition: opacity 220ms linear;
        }

        .theatre-tieback-left {
          left: 0;
          transform-origin: left center;
          transform:
            translate3d(calc((1 - var(--tie-progress)) * -154px), calc((1 - var(--tie-progress)) * 8px), 0)
            scale(calc(.88 + var(--tie-progress) * .12));
        }

        .theatre-tieback-right {
          right: 0;
          transform-origin: right center;
          transform:
            translate3d(calc((1 - var(--tie-progress)) * 154px), calc((1 - var(--tie-progress)) * 8px), 0)
            scale(calc(.88 + var(--tie-progress) * .12));
        }

        .theatre-tieback-rope {
          position: absolute;
          top: 28px;
          height: 12px;
          width: 142px;
          border-radius: 999px;
          background:
            repeating-linear-gradient(135deg,
              #845108 0 6px,
              #e2b04b 6px 12px,
              #9a610b 12px 18px,
              #f4cd74 18px 24px);
          box-shadow:
            inset 0 1px 0 rgba(255,243,199,.72),
            inset 0 -1px 0 rgba(88,44,5,.42);
        }

        .theatre-tieback-left .theatre-tieback-rope {
          left: 4px;
          transform: rotate(-6deg);
          transform-origin: left center;
        }

        .theatre-tieback-right .theatre-tieback-rope {
          right: 4px;
          transform: rotate(6deg);
          transform-origin: right center;
        }

        .theatre-tieback-knot {
          position: absolute;
          top: 21px;
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background:
            radial-gradient(circle at 32% 30%, rgba(255,248,205,.94), transparent 34%),
            linear-gradient(180deg, #f4d17a 0%, #c28b2d 58%, #7a4807 100%);
          box-shadow:
            0 4px 8px rgba(0,0,0,.22),
            inset 0 1px 0 rgba(255,249,220,.88);
        }

        .theatre-tieback-left .theatre-tieback-knot { left: 142px; }
        .theatre-tieback-right .theatre-tieback-knot { right: 142px; }

        .theatre-tieback-tassel {
          position: absolute;
          top: 42px;
          width: 26px;
          height: 54px;
          border-radius: 999px 999px 13px 13px;
          background:
            linear-gradient(180deg, #f2cd74 0%, #ca9131 25%, #f0cf7d 48%, #a66513 100%);
          box-shadow:
            inset 0 1px 0 rgba(255,248,216,.85),
            0 4px 10px rgba(0,0,0,.24);
        }

        .theatre-tieback-tassel::before,
        .theatre-tieback-tassel::after {
          content: "";
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(110,61,8,.38);
          border-radius: 999px;
        }

        .theatre-tieback-tassel::before {
          top: -6px;
          width: 14px;
          height: 10px;
        }

        .theatre-tieback-tassel::after {
          bottom: 7px;
          width: 18px;
          height: 28px;
          box-shadow:
            -6px 0 0 rgba(110,61,8,.22),
            6px 0 0 rgba(110,61,8,.22),
            -10px 0 0 rgba(110,61,8,.16),
            10px 0 0 rgba(110,61,8,.16);
        }

        .theatre-tieback-left .theatre-tieback-tassel { left: 141px; }
        .theatre-tieback-right .theatre-tieback-tassel { right: 141px; }

        /* ===== Inaugurated-by slide, matching the reference artwork ===== */
        .honouree-scene {
          position: relative;
          min-height: 430px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 0 7rem;
        }

        .honouree-spotlight {
          position: absolute;
          z-index: 0;
          left: 50%;
          top: -18%;
          width: min(74vw, 960px);
          height: 84%;
          transform: translateX(-50%);
          opacity: .55;
          background: conic-gradient(from 166deg at 50% 0%, transparent 0 41%, rgba(231,240,221,.10) 46%, rgba(255,244,201,.18) 50%, rgba(231,240,221,.10) 54%, transparent 59% 100%);
          filter: blur(8px);
          animation: spotlightPulse 4.8s ease-in-out infinite;
        }

        .honouree-sparkles span {
          position: absolute;
          z-index: 1;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #f1d37b;
          box-shadow: 0 0 12px rgba(241,211,123,.72);
          animation: starTwinkle 2.5s ease-in-out infinite;
        }

        .honouree-floor {
          position: absolute;
          z-index: 0;
          left: 50%;
          bottom: -5px;
          width: min(72vw, 900px);
          height: 130px;
          transform: translateX(-50%);
          perspective: 650px;
        }

        .honouree-floor-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          border: 1.5px solid rgba(219, 176, 70, .72);
          border-radius: 50%;
          transform: translate(-50%, -50%) rotateX(68deg);
          box-shadow: 0 0 22px rgba(219,176,70,.16);
        }

        .honouree-floor-ring-one { width: 72%; height: 115%; }
        .honouree-floor-ring-two { width: 100%; height: 155%; opacity: .6; }
        .honouree-floor-glow {
          position: absolute;
          left: 50%;
          top: 46%;
          width: 72%;
          height: 24px;
          transform: translate(-50%, -50%);
          background: radial-gradient(ellipse, rgba(255,215,118,.42), transparent 68%);
          filter: blur(5px);
        }

        @keyframes spotlightPulse {
          0%,100% { opacity: .36; }
          50% { opacity: .66; }
        }

        @keyframes starTwinkle {
          0%,100% { opacity: .16; transform: scale(.7); }
          50% { opacity: 1; transform: scale(1.35); }
        }

        @media (max-width: 760px) {
          .curtain-rope { width: 62px; height: 13px; }
          .curtain-tassel { transform: scale(.78); }
          .honouree-scene { min-height: 420px; padding-bottom: 5rem; }
          .honouree-floor { width: 90vw; }
          .curtain-top-swag { left: 3%; right: 3%; }
        }

      `}</style>
    </main>
  );
}
