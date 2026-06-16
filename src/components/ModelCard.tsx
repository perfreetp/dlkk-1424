import { useState } from "react";
import { Star, ShieldCheck, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelCardProps {
  id: string;
  name: string;
  year: number;
  screenType: string;
  hasFaceId: boolean;
  isSelected?: boolean;
  isPinned?: boolean;
  onSelect?: (id: string) => void;
  onPin?: (id: string) => void;
}

export default function ModelCard({
  id,
  name,
  year,
  screenType,
  hasFaceId,
  isSelected = false,
  isPinned = false,
  onSelect,
  onPin,
}: ModelCardProps) {
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState<number | null>(null);

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 1) {
      const timer = window.setTimeout(() => {
        onSelect?.(id);
        setClickCount(0);
      }, 250);
      setClickTimer(timer);
    } else if (newCount === 2) {
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
      onPin?.(id);
      setClickCount(0);
    }
  };

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin?.(id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 bg-white",
        "hover:shadow-lg hover:-translate-y-0.5",
        isSelected
          ? "border-success shadow-md shadow-success/20"
          : "border-primary-200 hover:border-primary-300",
        isPinned && "ring-2 ring-warning ring-offset-2"
      )}
    >
      {isPinned && (
        <div className="absolute -top-1 -right-1 bg-warning text-white text-xs px-2 py-0.5 rounded-full font-medium">
          置顶
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isSelected ? "bg-success/10" : "bg-primary-100"
            )}
          >
            <Smartphone
              size={20}
              className={cn(isSelected ? "text-success" : "text-primary-500")}
            />
          </div>
          <div>
            <h3 className="font-semibold text-primary-800 text-base">{name}</h3>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="font-mono text-xs text-primary-500">{year}</span>
              <span className="w-1 h-1 rounded-full bg-primary-300"></span>
              <span className="text-xs text-primary-500">{screenType}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePinClick}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            isPinned
              ? "text-warning bg-warning/10"
              : "text-primary-300 hover:text-warning hover:bg-warning/10"
          )}
        >
          <Star size={16} fill={isPinned ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-primary-100">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex items-center space-x-1.5 text-xs font-medium",
              hasFaceId ? "text-success" : "text-primary-400"
            )}
          >
            <ShieldCheck size={14} />
            <span>{hasFaceId ? "Face ID 支持" : "无 Face ID"}</span>
          </div>
          <span
            className={cn(
              "text-xs font-mono px-2 py-0.5 rounded",
              isSelected
                ? "bg-success/10 text-success"
                : "bg-primary-100 text-primary-600"
            )}
          >
            #{id}
          </span>
        </div>
      </div>
    </div>
  );
}
