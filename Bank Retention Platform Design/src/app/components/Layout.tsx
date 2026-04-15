import { Outlet, Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  User,
  Settings,
  BarChart3,
  Megaphone,
  Brain,
  ChevronDown,
} from "lucide-react";
import logoImg from "../../imports/image.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Executive Dashboard" },
    { path: "/workspace", icon: Users, label: "Retention Workspace" },
    { path: "/model-governance", icon: BarChart3, label: "Model Governance" },
    { path: "/campaigns", icon: Megaphone, label: "Campaign Center" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center">
              <ImageWithFallback src={logoImg} alt="BK TP.HCM Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-sm tracking-tight">Bank Retention</h1>
              <p className="text-[10px] font-bold text-blue-700 tracking-wider uppercase">BK TP.HCM</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link
              to="#"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 bg-gray-50/30">
          <details className="group relative">
            <summary className="list-none flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50/60 transition-colors cursor-pointer border border-transparent hover:border-blue-100 outline-none">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center border border-blue-200 group-open:bg-blue-600 transition-colors">
                  <Brain className="w-4.5 h-4.5 text-blue-700 group-open:text-white transition-colors" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">Project Credit</p>
                  <p className="text-xs text-blue-700 font-medium truncate">Click for author details</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 group-hover:text-blue-600 transition-all" />
            </summary>

            <div className="absolute right-0 bottom-full mb-3 w-64 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg shadow-blue-100/60">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Credit</p>
              <div className="mt-2 space-y-2 text-sm text-gray-700">
                <p className="leading-5">
                  <span className="font-semibold text-gray-900">Lecturer:</span> Assoc. Prof. Dr. Quan Thanh Tho
                </p>
                <p className="leading-5">
                  <span className="font-semibold text-gray-900">Students:</span> Phan Van Nguyen Khanh
                  <br />
                  Nguyen Tuong Phuc
                </p>
              </div>
            </div>
          </details>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
