import { useLocation, useNavigate } from "react-router-dom";
import { Home, MessageCircle, Radio, User } from "lucide-react";

export default function BottomNav() {
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
    <nav
      className="fixed bottom-0 inset-x-0 w-full bg-white dark:bg-gray-900 
                    border-t border-gray-200 dark:border-gray-800 
                    shadow-[0_-2px_10px_rgba(0,0,0,0.1)] 
                    z-50 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all rounded-lg ${
                item.active
                  ? "text-[#fc4561]"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
            >
              <Icon
                className={`w-6 h-6 mb-1 transition-transform ${
                  item.active ? "scale-110" : ""
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  item.active ? "font-bold" : ""
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
