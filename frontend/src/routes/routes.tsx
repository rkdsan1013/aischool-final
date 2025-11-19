// frontend/src/routes/routes.tsx
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
import VoiceRoomCreate from "../pages/VoiceRoomCreate";
import AITalkPageDetail from "../pages/AITalkPageDetail";
import AITalkCustomScenario from "../pages/AITalkCustomScenario";
import MyPageHistory from "../pages/MyPageHistory";
import MyPageProfile from "../pages/MyPageProfile";

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
      // VoiceRoom 생성 페이지
      {
        path: "/voiceroom/create",
        element: (
          <ProtectedRoute redirectTo="/auth">
            <VoiceRoomCreate />
          </ProtectedRoute>
        ),
      },
      // [ADDED] AITalk 커스텀 시나리오 생성/수정 페이지 (유지)
      {
        path: "/ai-talk/custom-scenario",
        element: (
          <ProtectedRoute redirectTo="/auth">
            <AITalkCustomScenario />
          </ProtectedRoute>
        ),
      },
      // ❌ [삭제] AITalk 상세 페이지는 AITalkPage 내부에서 상태로 처리됩니다.
      /*
      {
        path: "/ai-talk/:id",
        element: (
          <ProtectedRoute redirectTo="/auth">
            <AITalkPageDetail />
          </ProtectedRoute>
        ),
      },
      */
      {
        path: "/ai-talk/chat",
        element: (
          <ProtectedRoute redirectTo="/auth">
            <AITalkPageDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my/history",
        element: (
          <ProtectedRoute redirectTo="/auth">
            <MyPageHistory />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my/profile",
        element: (
          <ProtectedRoute redirectTo="/auth">
            <MyPageProfile />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // --- 네비게이션 있는 레이아웃 그룹 ---
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
      // ✅ [중요] AITalk 페이지가 이제 상세 페이지까지 처리합니다.
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
