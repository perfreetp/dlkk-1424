import { useState } from "react";
import { Check, AlertTriangle, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import ProgressBar from "./ProgressBar";

interface ScreenParam {
  label: string;
  value: number;
  variant?: "success" | "warning";
  unit?: string;
}

interface ScreenCardProps {
  id: string;
  grade: string;
  gradeLevel: "S" | "A" | "B" | "C";
  params: ScreenParam[];
  riskTips?: string[];
  price: number;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

const gradeColors: Record<string, { bg: string; text: string; border: string }> = {
  S: { bg: "bg-success/10", text: "text-success", border: "border-success" },
  A: { bg: "bg-primary-100", text: "text-primary-700", border: "border-primary-400" },
  B: { bg: "bg-warning/10", text: "text-warning", border: "border-warning" },
  C: { bg: "bg-primary-100", text: "text-primary-500", border: "border-primary-300" },
};

export default function ScreenCard({
  id,
  grade,
  gradeLevel,
  params,
  riskTips,
  price,
  isSelected = false,
  onSelect,
}: ScreenCardProps) {
  const [isChecked, setIsChecked] = useState(isSelected);
  const colorConfig = gradeColors[gradeLevel];

  const handleCheckboxChange = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onSelect?.(id, newValue);
  };

  return (
    <div
      className={cn(
        "relative p-5 rounded-xl border-2 transition-all duration-200 bg-white",
        isChecked
          ? "border-success shadow-lg shadow-success/10"
          : "border-primary-200 hover:border-primary-300 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center border-2",
              colorConfig.bg,
              colorConfig.border
            )}
          >
            <Shield size={22} className={colorConfig.text} />
          </div>
          <div>
            <h3 className="font-bold text-primary-800 text-lg">{grade}</h3>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span
                className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded",
                  colorConfig.bg,
                  colorConfig.text
                )}
              >
                Grade {gradeLevel}
              </span>
              <span className="text-xs text-primary-400 font-mono">#{id}</span>
            </div>
          </div>
        </div>

        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="sr-only"
          />
          <div
            className={cn(
              "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
              isChecked
                ? "bg-success border-success"
                : "border-primary-300 hover:border-primary-400"
            )}
          >
            {isChecked && <Check size={14} className="text-white" />}
          </div>
        </label>
      </div>

      <div className="space-y-3 mb-4">
        {params.map((param, index) => (
          <ProgressBar
            key={index}
            label={param.label}
            value={param.value}
            variant={param.variant || "success"}
            unit={param.unit || "%"}
            height="sm"
          />
        ))}
      </div>

      {riskTips && riskTips.length > 0 && (
        <div className="mb-4 p-3 bg-warning/5 rounded-lg border border-warning/20">
          <div className="flex items-start space-x-2">
            <AlertTriangle size={14} className="text-warning mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              {riskTips.map((tip, index) => (
                <p key={index} className="text-xs text-primary-600 leading-relaxed">
                  {tip}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-primary-100 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Zap size={16} className="text-success" />
          <span className="text-xs text-primary-500">参考价格</span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold font-mono text-primary-800">
            ¥{price.toLocaleString()}
          </span>
          <span className="text-xs text-primary-400 ml-1">/片</span>
        </div>
      </div>
    </div>
  );
}
