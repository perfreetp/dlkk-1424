import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  model: string;
  grade: string;
  stock: number;
  cost: number;
  price: number;
  profit: number;
  profitMargin: number;
  supplier: string;
  updateDate: string;
}

type SortDirection = "asc" | "desc" | null;

interface SortState {
  key: keyof InventoryItem | null;
  direction: SortDirection;
}

interface DataTableProps {
  data: InventoryItem[];
}

interface Column {
  key: keyof InventoryItem;
  label: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  width?: string;
}

const columns: Column[] = [
  { key: "id", label: "编号", sortable: true, width: "80px" },
  { key: "model", label: "型号", sortable: true },
  { key: "grade", label: "等级", sortable: true, align: "center" },
  { key: "stock", label: "库存", sortable: true, align: "right" },
  { key: "cost", label: "成本", sortable: true, align: "right" },
  { key: "price", label: "报价", sortable: true, align: "right" },
  { key: "profit", label: "毛利", sortable: true, align: "right" },
  { key: "profitMargin", label: "毛利率", sortable: true, align: "right", width: "100px" },
  { key: "supplier", label: "供应商", sortable: true },
  { key: "updateDate", label: "更新日期", sortable: true, align: "center" },
];

export default function DataTable({ data }: DataTableProps) {
  const [sortState, setSortState] = useState<SortState>({
    key: null,
    direction: null,
  });

  const handleSort = (key: keyof InventoryItem) => {
    setSortState((prev) => {
      if (prev.key !== key) {
        return { key, direction: "asc" };
      }
      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      if (prev.direction === "desc") {
        return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortState.key || !sortState.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aVal = a[sortState.key!];
      const bVal = b[sortState.key!];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortState.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortState.direction === "asc" ? -1 : 1;
      if (aStr > bStr) return sortState.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortState]);

  const getProfitColor = (margin: number) => {
    if (margin >= 30) return "text-success";
    if (margin >= 20) return "text-success/80";
    if (margin >= 10) return "text-warning";
    if (margin >= 0) return "text-warning/80";
    return "text-red-500";
  };

  const getProfitBg = (margin: number) => {
    if (margin >= 30) return "bg-success/10";
    if (margin >= 20) return "bg-success/5";
    if (margin >= 10) return "bg-warning/10";
    if (margin >= 0) return "bg-warning/5";
    return "bg-red-500/10";
  };

  const renderSortIcon = (key: keyof InventoryItem) => {
    if (sortState.key !== key) {
      return <ChevronsUpDown size={14} className="text-primary-300" />;
    }
    if (sortState.direction === "asc") {
      return <ChevronUp size={14} className="text-success" />;
    }
    if (sortState.direction === "desc") {
      return <ChevronDown size={14} className="text-success" />;
    }
    return <ChevronsUpDown size={14} className="text-primary-300" />;
  };

  const renderCellValue = (item: InventoryItem, key: keyof InventoryItem) => {
    const value = item[key];

    if (key === "profit" || key === "cost" || key === "price") {
      return (
        <span className="font-mono font-semibold">
          ¥{Number(value).toLocaleString()}
        </span>
      );
    }

    if (key === "profitMargin") {
      const margin = Number(value);
      return (
        <span
          className={cn(
            "font-mono font-bold px-2 py-1 rounded text-xs",
            getProfitColor(margin),
            getProfitBg(margin)
          )}
        >
          {margin >= 0 ? "+" : ""}
          {margin.toFixed(1)}%
        </span>
      );
    }

    if (key === "stock") {
      return (
        <span className="font-mono font-semibold">
          {Number(value).toLocaleString()}
        </span>
      );
    }

    if (key === "grade") {
      const gradeColors: Record<string, string> = {
        S: "bg-success/10 text-success border-success/30",
        A: "bg-primary-100 text-primary-700 border-primary-300",
        B: "bg-warning/10 text-warning border-warning/30",
        C: "bg-primary-100 text-primary-500 border-primary-200",
      };
      return (
        <span
          className={cn(
            "text-xs font-bold px-2 py-1 rounded border",
            gradeColors[String(value)] || "bg-primary-100 text-primary-600"
          )}
        >
          {String(value)}
        </span>
      );
    }

    return String(value);
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-primary-200 bg-white shadow-sm">
      <div className="px-5 py-4 border-b border-primary-200 bg-primary-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package size={18} className="text-primary-600" />
            <h3 className="font-semibold text-primary-800">库存报价清单</h3>
          </div>
          <span className="text-xs text-primary-500 font-mono">
            共 {data.length} 条记录
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary-50 border-b border-primary-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold text-primary-600 uppercase tracking-wider",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.width && `w-[${col.width}]`,
                    col.sortable && "cursor-pointer hover:bg-primary-100/50"
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div
                    className={cn(
                      "flex items-center space-x-1",
                      col.align === "right" && "justify-end",
                      col.align === "center" && "justify-center"
                    )}
                  >
                    <span>{col.label}</span>
                    {col.sortable && renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-100">
            {sortedData.map((item, index) => (
              <tr
                key={item.id}
                className={cn(
                  "transition-colors hover:bg-primary-50/50",
                  index % 2 === 1 && "bg-primary-50/30"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-sm text-primary-700",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center"
                    )}
                  >
                    {renderCellValue(item, col.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <div className="py-12 text-center">
          <Package size={40} className="mx-auto text-primary-300 mb-3" />
          <p className="text-primary-400">暂无数据</p>
        </div>
      )}
    </div>
  );
}
