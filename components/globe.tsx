"use client";

import { useEffect, useRef, useState } from "react";
import { Flag, type CountryCode } from "./flag";

/**
 * Hero globe. Built on `cobe` — the WebGL globe library the 21st.dev globe
 * components are built from (21st.dev is unreachable from this build
 * environment, so this is implemented directly against the same library).
 *
 * Country flags are HTML, positioned over the canvas by projecting each
 * lat/lng through the globe's current rotation every frame. cobe v2 can expose
 * marker anchors as CSS anchor-position properties, but that API only works in
 * Chromium today, so the projection is done here instead.
 *
 * Performance guardrails, because this product targets low-end Android over 3G
 * (docs/PROMPT.md §17): cobe is dynamically imported, rendering pauses
 * off-screen, devicePixelRatio is capped, sample count drops on phones, and
 * `prefers-reduced-motion` freezes rotation rather than removing the visual.
 */

type Place = {
  code: CountryCode;
  label: string;
  lat: number;
  lng: number;
  /** Destinations the product actually assesses today */
  supported?: boolean;
  /** Kept on small screens, where the globe is too small for the full set */
  compact?: boolean;
};

const PLACES: Place[] = [
  // Supported destinations
  { code: "US", label: "United States", lat: 38.9072, lng: -77.0369, supported: true, compact: true },
  { code: "CA", label: "Canada", lat: 45.4215, lng: -75.6972, supported: true, compact: true },
  { code: "GB", label: "United Kingdom", lat: 51.5072, lng: -0.1276, supported: true, compact: true },
  // Africa
  { code: "GH", label: "Ghana", lat: 5.6037, lng: -0.187, compact: true },
  { code: "NG", label: "Nigeria", lat: 9.0765, lng: 7.3986, compact: true },
  { code: "KE", label: "Kenya", lat: -1.2921, lng: 36.8219, compact: true },
  { code: "SN", label: "Senegal", lat: 14.7167, lng: -17.4677 },
  { code: "EG", label: "Egypt", lat: 30.0444, lng: 31.2357, compact: true },
  { code: "ET", label: "Ethiopia", lat: 9.03, lng: 38.74 },
  { code: "ZA", label: "South Africa", lat: -26.2041, lng: 28.0473, compact: true },
  // Europe & Middle East
  { code: "CH", label: "Switzerland", lat: 46.948, lng: 7.4474 },
  { code: "AE", label: "United Arab Emirates", lat: 25.2048, lng: 55.2708 },
  // Asia & Pacific
  { code: "IN", label: "India", lat: 28.6139, lng: 77.209 },
  { code: "SG", label: "Singapore", lat: 1.3521, lng: 103.8198 },
  { code: "CN", label: "China", lat: 39.9042, lng: 116.4074 },
  { code: "JP", label: "Japan", lat: 35.6762, lng: 139.6503 },
  { code: "AU", label: "Australia", lat: -33.8688, lng: 151.2093 },
  // Americas
  { code: "BR", label: "Brazil", lat: -23.5505, lng: -46.6333 },
];

const D2R = Math.PI / 180;
const THETA = 0.2;
/**
 * Sphere radius as a fraction of the canvas box, and the direction cobe
 * rotates. Both were solved against cobe's own marker anchors (it exposes
 * exact positions for markers given an `id`) at two different rotations:
 * the globe turns by -phi, and the sphere occupies 0.425 of the box.
 * The fit reproduces cobe's positions to ~1e-5, so pins sit exactly on
 * their markers instead of drifting.
 */
const RADIUS = 0.425;

/** Orthographic projection matching cobe's own marker placement. */
function project(lat: number, lng: number, phi: number) {
  const p = (90 - lat) * D2R;
  const t = (lng + 180) * D2R;
  const x0 = -Math.sin(p) * Math.cos(t);
  const y0 = Math.cos(p);
  const z0 = Math.sin(p) * Math.sin(t);

  const cp = Math.cos(-phi);
  const sp = Math.sin(-phi);
  const x = x0 * cp - z0 * sp;
  const zr = x0 * sp + z0 * cp;

  const ct = Math.cos(THETA);
  const st = Math.sin(THETA);
  const y = y0 * ct - zr * st;
  const z = y0 * st + zr * ct;

  return { x: 0.5 + x * RADIUS, y: 0.5 - y * RADIUS, z };
}

export function HeroGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pinRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [ready, setReady] = useState(false);
  const [dense, setDense] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let globe: { destroy: () => void; update: (s: { phi: number }) => void } | null = null;
    let raf = 0;
    let phi = 5.15;
    let visible = true;
    let cancelled = false;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 640;
    setDense(!small);
    const size = small ? 300 : 540;

    const paintPins = () => {
      for (let i = 0; i < PLACES.length; i++) {
        const el = pinRefs.current[i];
        if (!el) continue;
        const place = PLACES[i];
        const { x, y, z } = project(place.lat, place.lng, phi);
        if (z <= 0.3) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
        } else {
          // fade in as the pin comes round the limb
          el.style.opacity = String(Math.min(1, (z - 0.3) * 6));
          el.style.left = `${x * 100}%`;
          el.style.top = `${y * 100}%`;
        }
      }
    };

    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(wrap);

    import("cobe")
      .then(({ default: createGlobe }) => {
        if (cancelled || !canvasRef.current) return;
        globe = createGlobe(canvasRef.current, {
          devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
          width: size * 2,
          height: size * 2,
          phi,
          theta: THETA,
          dark: 0,
          diffuse: 1.15,
          mapSamples: small ? 9000 : 16000,
          mapBrightness: 5.2,
          baseColor: [0.98, 0.97, 0.96],
          markerColor: [0.06, 0.36, 0.55],
          glowColor: [0.93, 0.92, 0.89],
        });
        paintPins();
        setReady(true);

        // cobe v2 paints on update(), so the loop must run even when the
        // globe is not spinning — otherwise a reduced-motion visitor gets a
        // blank sphere. When motion is off we render a short warm-up and stop.
        let warmup = 0;
        const tick = () => {
          if (cancelled) return;
          const animating = visible && !reduced;
          if (animating) phi += 0.0016;
          if (animating || warmup < 45) {
            globe?.update({ phi });
            paintPins();
            warmup += 1;
          }
          if (animating || warmup < 45 || !reduced) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      })
      .catch(() => {
        /* WebGL unavailable: the halo and pins below still render */
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
      className="pointer-events-none relative mx-auto aspect-square w-[300px] sm:w-[420px] lg:w-[540px]"
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,var(--color-brand-soft),transparent_68%)]" />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 h-full w-full transition-opacity duration-1000"
        style={{ opacity: ready ? 1 : 0, contain: "layout paint size" }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0 }}
      >
        {PLACES.map((place, i) => (
          <div
            key={place.code}
            hidden={!dense && !place.compact}
            ref={(el) => {
              pinRefs.current[i] = el;
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 will-change-[left,top,opacity]"
            style={{ opacity: 0 }}
          >
            <Flag
              country={place.code}
              className={
                place.supported
                  ? "h-[15px] w-[22px] rounded-[3px] shadow-[0_1px_4px_rgb(22_35_58/0.28)] ring-[1.5px] ring-white sm:h-[18px] sm:w-[27px]"
                  : "h-[12px] w-[18px] rounded-[2px] shadow-[0_1px_3px_rgb(22_35_58/0.24)] ring-1 ring-white sm:h-[14px] sm:w-[21px]"
              }
            />
            <span className="sr-only">{place.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
