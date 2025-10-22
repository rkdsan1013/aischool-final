// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 루트는 랜딩페이지 */}
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
