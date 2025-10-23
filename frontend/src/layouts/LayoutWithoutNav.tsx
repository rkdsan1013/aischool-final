import { Outlet } from "react-router-dom";

export default function LayoutWithoutNav() {
  return (
    <>
      <Outlet />
    </>
  );
}
