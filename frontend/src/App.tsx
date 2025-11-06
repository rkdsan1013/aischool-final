// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LayoutWithoutNav from "./layouts/LayoutWithoutNav";
import LayoutWithNav from "./layouts/LayoutWithNav";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import MyPage from "./pages/MyPage";
import AITalk from "./pages/AITalkPage";
import VoiceRoomPage from "./pages/VoiceRoomPage";
import HomePage from "./pages/HomePage";
import AuthProvider from "./contexts/AuthContext";

// 라우트 래퍼
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 네비게이션 없는 레이아웃 */}
          <Route element={<LayoutWithoutNav />}>
            <Route
              path="/"
              element={
                <PublicOnlyRoute redirectTo="/home">
                  <LandingPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/auth"
              element={
                <PublicOnlyRoute redirectTo="/home">
                  <AuthPage />
                </PublicOnlyRoute>
              }
            />
          </Route>

          {/* 네비게이션 있는 레이아웃 */}
          <Route element={<LayoutWithNav />}>
            {/* 레벨 테스트가 인증 필요라면 ProtectedRoute로 감싸세요 */}
            <Route path="/level-test" element={<div>레벨 테스트</div>} />

            <Route
              path="/home"
              element={
                <ProtectedRoute redirectTo="/auth">
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-talk"
              element={
                <ProtectedRoute redirectTo="/auth">
                  <AITalk />
                </ProtectedRoute>
              }
            />
            <Route
              path="/voiceroom"
              element={
                <ProtectedRoute redirectTo="/auth">
                  <VoiceRoomPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my"
              element={
                <ProtectedRoute redirectTo="/auth">
                  <MyPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
