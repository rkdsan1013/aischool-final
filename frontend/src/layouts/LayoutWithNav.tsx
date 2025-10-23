import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav";

export default function LayoutWithNav() {
  return (
    <>
      <Outlet />
      {/* 모바일에서만 보이도록 */}
      <div className="sm:hidden">
        <BottomNav />
      </div>
    </>
  );
}
