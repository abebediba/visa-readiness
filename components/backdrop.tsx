/**
 * Ambient page backdrop: layered light washes plus a fine grain, so the warm
 * off-white reads as a surface with depth rather than a flat fill. Fixed and
 * non-interactive; pure CSS, no images to download.
 */
export function BackdropAmbience() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* cool wash, top right — the blue the brand already uses, at a whisper */}
      <div className="absolute -right-[18%] -top-[28%] h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgb(15_92_140/0.13),transparent_62%)] blur-[6px]" />
      {/* warm sand wash, mid left */}
      <div className="absolute -left-[22%] top-[22%] h-[62vh] w-[62vh] rounded-full bg-[radial-gradient(circle,rgb(196_160_96/0.14),transparent_64%)]" />
      {/* soft green-teal lift, lower right, ties to the accent */}
      <div className="absolute -right-[12%] top-[62%] h-[54vh] w-[54vh] rounded-full bg-[radial-gradient(circle,rgb(12_138_106/0.09),transparent_66%)]" />
      {/* faint meridian arcs: a globe motif carried into the page itself */}
      <svg
        className="absolute left-1/2 top-[6%] h-[92vh] w-[150vw] -translate-x-1/2 text-text/[0.045]"
        viewBox="0 0 1200 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <ellipse cx="600" cy="450" r="0" />
        {[220, 330, 440, 550].map((rx) => (
          <ellipse key={rx} cx="600" cy="450" rx={rx} ry="430" stroke="currentColor" strokeWidth="1" />
        ))}
        {[120, 260, 400].map((ry) => (
          <ellipse key={ry} cx="600" cy="450" rx="560" ry={ry} stroke="currentColor" strokeWidth="1" />
        ))}
      </svg>
      {/* grain: keeps large flat areas from banding and adds a printed feel */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
