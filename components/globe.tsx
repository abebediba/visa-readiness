"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hero globe. Built on `cobe` — the WebGL globe library the 21st.dev globe
 * components are built from (21st.dev itself is unreachable from this build
 * environment, so the component is implemented directly against the same
 * library rather than copied from the registry).
 *
 * Performance guardrails, because this product targets low-end Android over
 * 3G (docs/PROMPT.md §17):
 *  - `cobe` is imported dynamically, so its ~16KB stays out of the entry bundle
 *  - it only renders while the hero is on screen (IntersectionObserver)
 *  - devicePixelRatio is capped and the sample count drops on small screens
 *  - `prefers-reduced-motion` freezes rotation instead of disabling the visual
 */

// Destinations the product supports, plus origin cities it is built for.
const DESTINATIONS: [number, number][] = [
  [38.9072, -77.0369], // Washington, DC
  [45.4215, -75.6972], // Ottawa
  [51.5072, -0.1276], // London
];
const ORIGINS: [number, number][] = [
  [5.6037, -0.187], // Accra
  [6.5244, 3.3792], // Lagos
  [-1.2921, 36.8219], // Nairobi
  [-26.2041, 28.0473], // Johannesburg
  [30.0444, 31.2357], // Cairo
];

// Journeys, not decoration: origin cities out to the supported destinations.
const ARCS = [
  { from: ORIGINS[0], to: DESTINATIONS[2] }, // Accra -> London
  { from: ORIGINS[1], to: DESTINATIONS[0] }, // Lagos -> Washington
  { from: ORIGINS[2], to: DESTINATIONS[2] }, // Nairobi -> London
  { from: ORIGINS[3], to: DESTINATIONS[1] }, // Johannesburg -> Ottawa
  { from: ORIGINS[4], to: DESTINATIONS[0] }, // Cairo -> Washington
];

export function HeroGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let globe: { destroy: () => void; update: (s: { phi: number }) => void } | null = null;
    let raf = 0;
    let phi = 4.4; // opens on the Atlantic: Africa and the Americas both in view
    let visible = true;
    let cancelled = false;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 640;
    const size = small ? 270 : 540;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(wrap);

    import("cobe")
      .then(({ default: createGlobe }) => {
        if (cancelled || !canvasRef.current) return;
        globe = createGlobe(canvasRef.current, {
          devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
          width: size * 2,
          height: size * 2,
          phi,
          theta: 0.22,
          dark: 0,
          diffuse: 1.15,
          mapSamples: small ? 9000 : 16000,
          mapBrightness: 5.2,
          baseColor: [0.98, 0.97, 0.96],
          markerColor: [0.06, 0.36, 0.55],
          glowColor: [0.93, 0.92, 0.89],
          markers: [
            ...DESTINATIONS.map((location) => ({ location, size: 0.055 })),
            ...ORIGINS.map((location) => ({ location, size: 0.032 })),
          ],
          arcs: small ? [] : ARCS,
          arcColor: [0.16, 0.45, 0.63],
          arcWidth: 0.35,
          arcHeight: 0.28,
        });
        setReady(true);

        const tick = () => {
          if (cancelled) return;
          // Rotation pauses off-screen and under reduced-motion; the globe
          // itself stays visible either way.
          if (visible && !reduced) {
            phi += 0.0022;
            globe?.update({ phi });
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      })
      .catch(() => {
        /* WebGL unavailable or blocked: the static halo below stands in */
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      globe?.destroy();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none relative mx-auto aspect-square w-[270px] sm:w-[400px] lg:w-[520px]"
    >
      {/* soft halo, also the placeholder before WebGL paints */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,var(--color-brand-soft),transparent_68%)]" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full transition-opacity duration-1000"
        style={{ opacity: ready ? 1 : 0, contain: "layout paint size" }}
      />
    </div>
  );
}
