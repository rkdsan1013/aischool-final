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
      name: "블라블라",
      icon: MessageCircle,
      path: "/ai-talk",
      active: pathname.startsWith("/ai-talk"),
    },
    {
      name: "보이스룸",
      icon: Radio,
      path: "/voiceroom",
      active: pathname.startsWith("/voiceroom"),
    },
    {
      name: "내 정보",
      icon: User,
      path: "/my",
      active: pathname.startsWith("/my"),
    },
  ];

  return (
    <nav className="flex flex-col p-4 space-y-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-4 px-4 py-3 rounded-md text-base font-medium transition-all ${
              item.active
                ? "text-rose-500 bg-rose-50 dark:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            }`}
          >
            <Icon className="w-6 h-6" />
            {/* SideNav는 lg 이상에서만 보이므로 텍스트를 항상 표시합니다. */}
            <span>{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
