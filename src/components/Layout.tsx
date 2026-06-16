import { useState } from "react";
import {
  LayoutDashboard,
  Smartphone,
  Monitor,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "概览", icon: <LayoutDashboard size={18} /> },
  { id: "models", label: "型号管理", icon: <Smartphone size={18} /> },
  { id: "screens", label: "屏幕方案", icon: <Monitor size={18} /> },
  { id: "notes", label: "兼容提醒", icon: <AlertTriangle size={18} /> },
  { id: "inventory", label: "库存报价", icon: <BarChart3 size={18} /> },
];

export default function Layout({ children }: LayoutProps) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-primary-50">
      <nav className="bg-primary border-b border-primary-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-success rounded flex items-center justify-center">
                <Monitor size={18} className="text-white" />
              </div>
              <span className="text-white font-semibold text-lg tracking-wide">
                屏幕适配系统
              </span>
            </div>
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center space-x-1.5 px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium",
                    activeTab === item.id
                      ? "bg-success text-white shadow-md"
                      : "text-primary-300 hover:text-white hover:bg-primary-700"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
