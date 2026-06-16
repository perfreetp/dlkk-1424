import { NavLink, useLocation } from "react-router-dom";
import { Smartphone, Monitor, AlertTriangle, BarChart3, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: "/model-select", label: "型号选择", icon: <Smartphone size={18} /> },
  { path: "/screen-options", label: "屏幕方案", icon: <Monitor size={18} /> },
  { path: "/compatibility", label: "兼容提醒", icon: <AlertTriangle size={18} /> },
  { path: "/inventory", label: "库存报价", icon: <BarChart3 size={18} /> },
  { path: "/compare", label: "对比清单", icon: <ListChecks size={18} /> },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="min-h-screen bg-primary-50">
      <nav className="bg-primary-800 border-b border-primary-700 sticky top-0 z-50">
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
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-1.5 px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium",
                    isActive(item.path)
                      ? "bg-success text-white shadow-md"
                      : "text-primary-300 hover:text-white hover:bg-primary-700"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-6 animate-fade-in">{children}</main>
    </div>
  );
}
