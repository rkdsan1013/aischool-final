import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { routes } from "./routes/routes"; // ✅ 라우트 정의 가져오기

import ScrollToTop from "./pages/ScrollToTop";
import AuthProvider from "./providers/AuthProvider";
import { setNavigator } from "./routes/navigate";

// ✅ NavigatorSetter: useNavigate를 전역 navigate 헬퍼에 연결
function NavigatorSetter() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);
  return null;
}

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <ScrollToTop />
        <NavigatorSetter />
        <Outlet />
      </AuthProvider>
    ),
    children: routes,
  },
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
