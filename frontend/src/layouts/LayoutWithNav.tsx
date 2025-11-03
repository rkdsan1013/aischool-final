import { Outlet, useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import SideNav from "../components/SideNav";

export default function LayoutWithNav() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* 웹/태블릿 환경: 좌측 사이드바 (fixed) */}
      <div className="hidden sm:flex">
        <aside
          className="fixed top-0 left-0 h-full 
                          bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
                          flex flex-col 
                          w-64 md:w-20 lg:w-64"
        >
          {/* 상단 브랜드 영역 (로고 크기 키움) */}
          <div
            className="h-20 flex items-center px-4 text-3xl lg:text-4xl font-extrabold text-rose-500 cursor-pointer"
            onClick={() => navigate("/home")}
          >
            {/* 데스크탑에서는 전체 로고, 태블릿에서는 축약 */}
            <span className="hidden lg:block">Blabla</span>
            <span className="block lg:hidden">B</span>
          </div>
          <SideNav />
        </aside>
      </div>

      {/* 메인 콘텐츠 (사이드바 폭만큼 padding-left) */}
      <main className="sm:ml-64 md:ml-20 lg:ml-64">
        <Outlet />
      </main>

      {/* 모바일 환경: 하단 네비게이션 */}
      <div className="sm:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
