// frontend/src/App.tsx
import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { routes } from "./routes/routes";
import ScrollToTop from "./components/ScrollToTop";
import AuthProvider from "./providers/AuthProvider";
import ProfileProvider from "./providers/ProfileProvider";
import { setNavigator } from "./routes/navigate";

// NavigatorSetter: useNavigate를 전역 navigate 헬퍼에 연결
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
      <ProfileProvider>
        <AuthProvider>
          <ScrollToTop />
          <NavigatorSetter />
          <Outlet />
        </AuthProvider>
      </ProfileProvider>
    ),
    children: routes,
  },
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
