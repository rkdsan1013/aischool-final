import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LayoutWithoutNav from "./layouts/LayoutWithoutNav";
import LayoutWithNav from "./layouts/LayoutWithNav";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 네비게이션 없는 레이아웃 */}
        <Route element={<LayoutWithoutNav />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          {/* <Route path="/level-test" /> */}
        </Route>

        {/* 네비게이션 있는 레이아웃 */}
        <Route element={<LayoutWithNav />}>
          <Route path="/level-test" />
          <Route path="/home" />
          <Route path="/ai-talk" />
          <Route path="/voiceroom" />
          <Route path="/my" />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
