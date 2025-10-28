import { Outlet, useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import SideNav from "../components/SideNav";

export default function LayoutWithNav() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* 웹 환경: 좌측 사이드바 (fixed) */}
      <div className="hidden sm:flex">
        <aside className="fixed top-0 left-0 h-full w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          {/* 상단 브랜드 영역 (좌측 정렬, 구분선 제거) */}
          <div
            className="h-16 flex items-center px-4 text-2xl font-bold text-rose-500 cursor-pointer"
            onClick={() => navigate("/home")}
          >
            Blabla
          </div>
          <SideNav />
        </aside>
      </div>

      {/* 메인 콘텐츠 (사이드바 폭만큼 padding-left) */}
      <main className="sm:ml-56">
        <Outlet />
      </main>

      {/* 모바일 환경: 하단 네비게이션 */}
      <div className="sm:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
