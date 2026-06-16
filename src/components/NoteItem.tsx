import { useState } from "react";
import { Heart, AlertCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type RiskLevel = "low" | "medium" | "high" | "critical";

interface NoteItemProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  details: string;
  riskLevel: RiskLevel;
  isFavorite?: boolean;
  onFavorite?: (id: string, favorite: boolean) => void;
  onClick?: (id: string) => void;
}

const riskConfig: Record<
  RiskLevel,
  { color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  low: {
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    icon: <Info size={14} />,
  },
  medium: {
    color: "text-primary-500",
    bg: "bg-primary-500/10",
    border: "border-primary-500/20",
    icon: <AlertCircle size={14} />,
  },
  high: {
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    icon: <AlertTriangle size={14} />,
  },
  critical: {
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: <XCircle size={14} />,
  },
};

export default function NoteItem({
  id,
  icon,
  title,
  details,
  riskLevel,
  isFavorite = false,
  onFavorite,
  onClick,
}: NoteItemProps) {
  const [favorite, setFavorite] = useState(isFavorite);
  const config = riskConfig[riskLevel];

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = !favorite;
    setFavorite(newValue);
    onFavorite?.(id, newValue);
  };

  const handleClick = () => {
    onClick?.(id);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group p-4 rounded-lg border bg-white transition-all duration-200 cursor-pointer",
        "hover:shadow-md hover:border-primary-300",
        config.border
      )}
    >
      <div className="flex items-start space-x-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            config.bg
          )}
        >
          <div className={config.color}>{icon}</div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-primary-800 text-sm truncate">
                {title}
              </h4>
              <span
                className={cn(
                  "flex items-center space-x-0.5 text-xs px-1.5 py-0.5 rounded font-medium",
                  config.bg,
                  config.color
                )}
              >
                {config.icon}
                <span className="capitalize">{riskLevel}</span>
              </span>
            </div>
            <button
              onClick={handleFavoriteClick}
              className={cn(
                "p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100",
                favorite
                  ? "text-red-500 bg-red-500/10 opacity-100"
                  : "text-primary-300 hover:text-red-500 hover:bg-red-500/10"
              )}
            >
              <Heart size={16} fill={favorite ? "currentColor" : "none"} />
            </button>
          </div>
          <p className="mt-1 text-xs text-primary-500 leading-relaxed line-clamp-2">
            {details}
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-[10px] font-mono text-primary-400">#{id}</span>
            <span className="text-[10px] text-primary-300">•</span>
            <span className="text-[10px] text-primary-400">点击查看详情</span>
          </div>
        </div>
      </div>
    </div>
  );
}
