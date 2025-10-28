import { useLocation, useNavigate } from "react-router-dom";
import { Home, MessageCircle, Radio, User } from "lucide-react";

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const navItems = [
    {
      name: "홈",
      icon: Home,
      path: "/home",
      active: pathname === "/home" || pathname === "/",
    },
    {
      name: "AI Talk",
      icon: MessageCircle,
      path: "/ai-talk",
      active: pathname.startsWith("/ai-talk"),
    },
    {
      name: "VoiceRoom",
      icon: Radio,
      path: "/voiceroom",
      active: pathname.startsWith("/voiceroom"),
    },
    { name: "My", icon: User, path: "/my", active: pathname.startsWith("/my") },
  ];

  return (
    <nav className="flex flex-col p-4 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              item.active
                ? "text-rose-500 bg-rose-50 dark:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
