import { Check, X, Shield, Clock, TrendingUp, TrendingDown, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompareScheme {
  id: string;
  name: string;
  grade: string;
  gradeLevel: "S" | "A" | "B" | "C";
  price: number;
  warranty: string;
  pros: string[];
  cons: string[];
  isRecommended?: boolean;
}

interface CompareCardProps {
  schemes: CompareScheme[];
  onSelect?: (id: string) => void;
}

const gradeColors: Record<string, { bg: string; text: string; border: string }> = {
  S: { bg: "bg-success/10", text: "text-success", border: "border-success" },
  A: { bg: "bg-primary-100", text: "text-primary-700", border: "border-primary-400" },
  B: { bg: "bg-warning/10", text: "text-warning", border: "border-warning" },
  C: { bg: "bg-primary-100", text: "text-primary-500", border: "border-primary-300" },
};

export default function CompareCard({ schemes, onSelect }: CompareCardProps) {
  if (schemes.length < 2) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-primary-200">
        <Shield size={40} className="mx-auto text-primary-300 mb-3" />
        <p className="text-primary-500">请选择至少两个方案进行对比</p>
      </div>
    );
  }

  const getPriceDiff = (price: number) => {
    const basePrice = Math.min(...schemes.map((s) => s.price));
    const diff = price - basePrice;
    if (diff === 0) return null;
    return diff;
  };

  return (
    <div className="bg-white rounded-xl border border-primary-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 bg-primary-50 border-b border-primary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award size={18} className="text-primary-600" />
            <h3 className="font-semibold text-primary-800">方案对比</h3>
          </div>
          <span className="text-xs text-primary-500 font-mono">
            共 {schemes.length} 个方案
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-primary-200">
              <th className="w-32 px-6 py-4 text-left text-xs font-semibold text-primary-500 uppercase tracking-wider bg-primary-50/50 sticky left-0">
                对比项
              </th>
              {schemes.map((scheme) => {
                const colors = gradeColors[scheme.gradeLevel];
                return (
                  <th
                    key={scheme.id}
                    className={cn(
                      "px-6 py-4 text-center min-w-[200px]",
                      scheme.isRecommended && "bg-success/5"
                    )}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      {scheme.isRecommended && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success text-white uppercase tracking-wider">
                          推荐
                        </span>
                      )}
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center border-2",
                          colors.bg,
                          colors.border
                        )}
                      >
                        <Shield size={20} className={colors.text} />
                      </div>
                      <div>
                        <p className="font-bold text-primary-800">{scheme.name}</p>
                        <span
                          className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded",
                            colors.bg,
                            colors.text
                          )}
                        >
                          {scheme.grade}
                        </span>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-100">
            <tr>
              <td className="px-6 py-4 text-sm font-medium text-primary-600 bg-primary-50/50 sticky left-0">
                <div className="flex items-center space-x-2">
                  <TrendingUp size={14} className="text-success" />
                  <span>价格</span>
                </div>
              </td>
              {schemes.map((scheme) => {
                const diff = getPriceDiff(scheme.price);
                return (
                  <td
                    key={scheme.id}
                    className={cn(
                      "px-6 py-4 text-center",
                      scheme.isRecommended && "bg-success/5"
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold font-mono text-primary-800">
                        ¥{scheme.price.toLocaleString()}
                      </span>
                      {diff !== null && (
                        <span
                          className={cn(
                            "text-xs font-mono mt-1",
                            diff > 0 ? "text-warning" : "text-success"
                          )}
                        >
                          {diff > 0 ? "+" : ""}
                          ¥{diff.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="px-6 py-4 text-sm font-medium text-primary-600 bg-primary-50/50 sticky left-0">
                <div className="flex items-center space-x-2">
                  <Clock size={14} className="text-primary-500" />
                  <span>质保</span>
                </div>
              </td>
              {schemes.map((scheme) => (
                <td
                  key={scheme.id}
                  className={cn(
                    "px-6 py-4 text-center",
                    scheme.isRecommended && "bg-success/5"
                  )}
                >
                  <span className="text-sm font-mono font-semibold text-primary-700">
                    {scheme.warranty}
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td className="px-6 py-4 text-sm font-medium text-primary-600 bg-primary-50/50 sticky left-0">
                <div className="flex items-center space-x-2">
                  <Check size={14} className="text-success" />
                  <span>优点</span>
                </div>
              </td>
              {schemes.map((scheme) => (
                <td
                  key={scheme.id}
                  className={cn(
                    "px-6 py-4 align-top",
                    scheme.isRecommended && "bg-success/5"
                  )}
                >
                  <ul className="space-y-2">
                    {scheme.pros.map((pro, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check size={14} className="text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-primary-600">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            <tr>
              <td className="px-6 py-4 text-sm font-medium text-primary-600 bg-primary-50/50 sticky left-0">
                <div className="flex items-center space-x-2">
                  <TrendingDown size={14} className="text-warning" />
                  <span>缺点</span>
                </div>
              </td>
              {schemes.map((scheme) => (
                <td
                  key={scheme.id}
                  className={cn(
                    "px-6 py-4 align-top",
                    scheme.isRecommended && "bg-success/5"
                  )}
                >
                  <ul className="space-y-2">
                    {scheme.cons.map((con, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <X size={14} className="text-warning mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-primary-600">{con}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            <tr className="bg-primary-50/30">
              <td className="px-6 py-4 text-sm font-medium text-primary-600 sticky left-0 bg-primary-50/50">
                操作
              </td>
              {schemes.map((scheme) => (
                <td
                  key={scheme.id}
                  className={cn(
                    "px-6 py-4 text-center",
                    scheme.isRecommended && "bg-success/5"
                  )}
                >
                  <button
                    onClick={() => onSelect?.(scheme.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      scheme.isRecommended
                        ? "bg-success text-white hover:bg-success/90"
                        : "bg-primary-100 text-primary-700 hover:bg-primary-200"
                    )}
                  >
                    选择此方案
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
