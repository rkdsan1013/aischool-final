import { Outlet, useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import SideNav from "../components/SideNav";

export default function LayoutWithNav() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* 웹(lg) 환경: 좌측 사이드바 (fixed) */}
      <div className="hidden lg:flex">
        <aside
          className="fixed top-0 left-0 h-full 
                      bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
                      flex flex-col 
                      w-64" // lg 이상에서 항상 w-64
        >
          {/* 상단 브랜드 영역 (로고 크기 키움) */}
          <div
            className="h-20 flex items-center px-4 text-3xl lg:text-4xl font-extrabold text-rose-500 cursor-pointer"
            onClick={() => navigate("/home")}
          >
            {/* 이 블록 자체가 lg 이상에서만 보이므로 단순화 */}
            <span>Blabla</span>
          </div>
          <SideNav />
        </aside>
      </div>

      {/* 메인 콘텐츠 (웹 환경에서만 padding-left) */}
      <main className="lg:ml-64">
        {" "}
        {/* lg 이상에서만 사이드바 너비만큼 여백 */}
        <Outlet />
      </main>

      {/* 모바일/태블릿(lg 미만) 환경: 하단 네비게이션 */}
      <div className="lg:hidden">
        {" "}
        {/* lg 이상에서 숨김 */}
        <BottomNav />
      </div>
    </div>
  );
}
