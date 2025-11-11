// src/routes/routes.tsx
import type { RouteObject } from "react-router-dom";

import LayoutWithoutNav from "../layouts/LayoutWithoutNav";
import LayoutWithNav from "../layouts/LayoutWithNav";

import LandingPage from "../pages/LandingPage";
import AuthPage from "../pages/AuthPage";
import HomePage from "../pages/HomePage";
import MyPage from "../pages/MyPage";
import AITalk from "../pages/AITalkPage";
import VoiceRoomPage from "../pages/VoiceRoomPage";
import TrainingPage from "../pages/Training";
import AITalkPageDetail from "../pages/AITalkPageDetail";
import AITalkCustomScenario from "../pages/AITalkCustomScenario";
import VoiceRoomCreate from "../pages/VoiceRoomCreate";

import PublicOnlyRoute from "./PublicOnlyRoute";
import ProtectedRoute from "./ProtectedRoute";

export const routes: RouteObject[] = [
  // 네비게이션 없는 레이아웃 그룹
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
      {
        path: "/training",
        element: (
          <ProtectedRoute redirectTo="/auth">
            <TrainingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/ai-talk/:id",
        element: (
          <ProtectedRoute redirectTo="/auth">
            <AITalkPageDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "/ai-talk/custom-scenario",
        element: (
          <ProtectedRoute redirectTo="/auth">
            <AITalkCustomScenario />
          </ProtectedRoute>
        ),
      },
      {
        path: "/voiceroom/create",
        element: (
          <ProtectedRoute redirectTo="/auth">
            <VoiceRoomCreate />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // 네비게이션 있는 레이아웃 그룹
  {
    element: <LayoutWithNav />,
    children: [
      {
        path: "/level-test",
        element: <div>레벨 테스트</div>,
      },
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
];
