import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigate,
} from "react-router-dom";
import type { RouteObject } from "react-router-dom";

import LayoutWithoutNav from "./layouts/LayoutWithoutNav";
import LayoutWithNav from "./layouts/LayoutWithNav";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import MyPage from "./pages/MyPage";
import AITalk from "./pages/AITalkPage";
import VoiceRoomPage from "./pages/VoiceRoomPage";
import HomePage from "./pages/HomePage";
import TrainingPage from "./pages/Training";
import ScrollToTop from "./pages/ScrollToTop";

import AuthProvider from "./providers/AuthProvider";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import ProtectedRoute from "./components/ProtectedRoute";

import { setNavigator } from "./router/navigate";

// ✅ NavigatorSetter: useNavigate를 전역 navigate 헬퍼에 연결
function NavigatorSetter() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigator(navigate);
  }, [navigate]);
  return null;
}

const routes: RouteObject[] = [
  {
    element: (
      <AuthProvider>
        <ScrollToTop />
        <NavigatorSetter />
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        element: <LayoutWithoutNav />,
        children: [
          {
            path: "/",
            element: (
              <PublicOnlyRoute redirectTo="/home">
                <LandingPage />
              </PublicOnlyRoute>
            ),
          },
          {
            path: "/auth",
            element: (
              <PublicOnlyRoute redirectTo="/home">
                <AuthPage />
              </PublicOnlyRoute>
            ),
          },
          { path: "/training", element: <TrainingPage /> },
        ],
      },
      {
        element: <LayoutWithNav />,
        children: [
          { path: "/level-test", element: <div>레벨 테스트</div> },
          {
            path: "/home",
            element: (
              <ProtectedRoute redirectTo="/auth">
                <HomePage />
              </ProtectedRoute>
            ),
          },
          {
            path: "/ai-talk",
            element: (
              <ProtectedRoute redirectTo="/auth">
                <AITalk />
              </ProtectedRoute>
            ),
          },
          {
            path: "/voiceroom",
            element: (
              <ProtectedRoute redirectTo="/auth">
                <VoiceRoomPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "/my",
            element: (
              <ProtectedRoute redirectTo="/auth">
                <MyPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
];

const router = createBrowserRouter(routes);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
