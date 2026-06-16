import { cn } from "@/lib/utils";

type ProgressVariant = "success" | "warning";

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue?: number;
  variant?: ProgressVariant;
  showValue?: boolean;
  unit?: string;
  height?: "sm" | "md" | "lg";
  animate?: boolean;
}

const variantStyles: Record<ProgressVariant, string> = {
  success: "bg-success",
  warning: "bg-warning",
};

const heightStyles: Record<string, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3.5",
};

export default function ProgressBar({
  label,
  value,
  maxValue = 100,
  variant = "success",
  showValue = true,
  unit = "%",
  height = "md",
  animate = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-primary-600">{label}</span>
        {showValue && (
          <span className="text-xs font-mono font-semibold text-primary-800">
            {value}
            {unit}
          </span>
        )}
      </div>
      <div
        className={cn(
          "w-full bg-primary-100 rounded-full overflow-hidden",
          heightStyles[height]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            variantStyles[variant],
            animate && "animate-progress-fill"
          )}
          style={
            {
              "--progress-width": `${percentage}%`,
              width: animate ? undefined : `${percentage}%`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}
