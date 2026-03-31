import { cn } from "@/lib/utils";

type GradientPanelProps = {
  palette: [string, string, string];
  label?: string;
  className?: string;
};

export function GradientPanel({ palette, label, className }: GradientPanelProps) {
  const style = {
    backgroundImage: `radial-gradient(circle at top left, ${palette[2]}, transparent 35%), linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
  };

  return (
    <div
      style={style}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.24)]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%,rgba(255,255,255,0.02))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.28),transparent_26%)]" />
      {label ? (
        <div className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-white/80 backdrop-blur">
          {label}
        </div>
      ) : null}
    </div>
  );
}
