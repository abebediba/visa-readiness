/**
 * Page backdrop: engraved guilloche rosettes — the interference line-work used
 * on passports, visas and banknotes — laid over warm light washes with a fine
 * grain. Thematically it is the paper the product is about; visually it gives
 * the off-white depth without any dark treatment. Generated as SVG paths at
 * build time, so nothing is downloaded and nothing animates.
 */

function guilloche(cx: number, cy: number, R: number, amp: number, petals: number, turns = 1) {
  const steps = 300 * turns;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * turns;
    const r = R + amp * Math.cos(petals * t);
    const x = cx + r * Math.cos(t);
    const y = cy + r * Math.sin(t);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d + "Z";
}

function Rosette({
  cx,
  cy,
  scale = 1,
  petals,
}: {
  cx: number;
  cy: number;
  scale?: number;
  petals: number;
}) {
  // Many close-set rings with a small amplitude read as engraved line-work;
  // few rings with a large amplitude just read as squiggles.
  const rings = Array.from({ length: 9 }, (_, i) => ({
    R: (330 - i * 26) * scale,
    amp: (330 - i * 26) * 0.11 * scale,
    petals: petals + i * 3,
    w: 0.65,
  }));
  return (
    <g fill="none" stroke="currentColor">
      {rings.map((ring, i) => (
        <path key={i} d={guilloche(cx, cy, ring.R, ring.amp, ring.petals)} strokeWidth={ring.w} />
      ))}
      {[104, 88, 72].map((r) => (
        <circle key={r} cx={cx} cy={cy} r={r * scale} strokeWidth="0.55" />
      ))}
    </g>
  );
}

export function BackdropAmbience() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* warm base wash so the paper reads warm, not clinical */}
      <div className="absolute inset-0 bg-[radial-gradient(110%_75%_at_80%_-10%,rgb(15_92_140/0.20),transparent_55%),radial-gradient(85%_65%_at_-8%_38%,rgb(196_150_60/0.20),transparent_58%),radial-gradient(75%_60%_at_102%_88%,rgb(14_138_125/0.16),transparent_60%),radial-gradient(70%_55%_at_25%_105%,rgb(106_76_181/0.13),transparent_62%)]" />

      {/* engraved security line-work */}
      <svg
        className="absolute -right-[16%] -top-[22%] h-[105vh] w-[105vh] text-brand/[0.16]"
        viewBox="0 0 900 900"
      >
        <Rosette cx={450} cy={450} petals={9} />
      </svg>
      <svg
        className="absolute -bottom-[26%] -left-[18%] h-[80vh] w-[80vh] text-text/[0.09]"
        viewBox="0 0 900 900"
      >
        <Rosette cx={450} cy={450} scale={0.82} petals={13} />
      </svg>

      {/* fine ruled lines, as on a passport data page */}
      <div className="absolute inset-x-0 top-0 h-[52vh] bg-[repeating-linear-gradient(180deg,rgb(22_35_58/0.028)_0px,rgb(22_35_58/0.028)_1px,transparent_1px,transparent_9px)]" />

      {/* grain: stops the large flat areas banding, adds a printed feel */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
