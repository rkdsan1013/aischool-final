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
import ScrollToTop from "./pages/ScrollToTop";
import TrainingPage from "./pages/Training";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* 네비게이션 없는 레이아웃 */}
        <Route element={<LayoutWithoutNav />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/training/:section" element={<TrainingPage />} />

          {/* <Route path="/level-test" /> */}
        </Route>

        {/* 네비게이션 있는 레이아웃 */}
        <Route element={<LayoutWithNav />}>
          <Route path="/level-test" />
          <Route path="/home" element={<HomePage />} />
          <Route path="/ai-talk" element={<AITalk />} />
          <Route path="/voiceroom" element={<VoiceRoomPage />} />
          <Route path="/my" element={<MyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
