/** A phone body around a screen. `width` is the outer width in px. */
export function PhoneFrame({
  children,
  className = "",
  bezel = 8,
}: {
  children: React.ReactNode;
  className?: string;
  bezel?: number;
}) {
  return (
    <div
      className={`relative w-fit rounded-[2.4rem] bg-[#1b1320] shadow-[0_30px_60px_-20px_rgba(43,24,70,0.45),0_0_0_1px_rgba(255,255,255,0.06)_inset] ${className}`}
      style={{ padding: bezel }}
    >
      <div className="relative overflow-hidden rounded-[1.9rem] bg-black">{children}</div>
      <span className="pointer-events-none absolute left-1/2 top-[calc(var(--b,8px)+10px)] z-10 h-[18px] w-[30%] -translate-x-1/2 rounded-full bg-black/85" style={{ ["--b" as string]: `${bezel}px` }} />
    </div>
  );
}

/**
 * Renders children on a 390×844 "phone screen" and scales it to `width` px.
 * Used to show real template covers at any size without re-designing them.
 */
export function ScaledScreen({ width, children }: { width: number; children: React.ReactNode }) {
  const scale = width / 390;
  return (
    <div className="relative overflow-hidden" style={{ width, height: Math.round(844 * scale) }}>
      <div className="screen origin-top-left" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
