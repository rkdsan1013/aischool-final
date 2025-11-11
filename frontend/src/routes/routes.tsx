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
import VoiceRoomDetail from "../pages/VoiceRoomDetail";
import VoiceRoomCreate from "../pages/VoiceRoomCreate"; // [ADDED]
import AITalkPageDetail from "../pages/AITalkPageDetail"; // [ADDED]
import AITalkCustomScenario from "../pages/AITalkCustomScenario"; // [ADDED]

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
        element: <TrainingPage />,
      },
      {
        path: "/voiceroom/room/:roomId",
        element: (
          <ProtectedRoute redirectTo="/auth">
            <VoiceRoomDetail />
          </ProtectedRoute>
        ),
      },
      // [ADDED] VoiceRoom 생성 페이지
      {
        path: "/voiceroom/create",
        element: (
          <ProtectedRoute redirectTo="/auth">
            <VoiceRoomCreate />
          </ProtectedRoute>
        ),
      },
      // [ADDED] AITalk 커스텀 시나리오 생성/수정 페이지
      {
        path: "/ai-talk/custom-scenario",
        element: (
          <ProtectedRoute redirectTo="/auth">
            <AITalkCustomScenario />
          </ProtectedRoute>
        ),
      },
      // [ADDED] AITalk 상세 (채팅) 페이지 - :id가 custom-scenario보다 뒤에 와야 함
      {
        path: "/ai-talk/:id",
        element: (
          <ProtectedRoute redirectTo="/auth">
            <AITalkPageDetail />
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
