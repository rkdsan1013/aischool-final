import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { GraduationCap, LogIn } from "lucide-react"; // 아이콘은 주석 처리

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 애니메이션 트리거
    setTimeout(() => setIsVisible(true), 200);
    setTimeout(() => setShowButtons(true), 800);
  }, []);

  const handleQuickLogin = () => {
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-rose-500 flex items-center justify-center p-4">
      <div
        className={`text-center transition-all duration-1000 ${
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* 로고/타이틀 */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-white mb-4 tracking-tight">
          Blabla
        </h1>

        {/* 소개 멘트 */}
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-light mb-12">
          Stop typing, Start talking
        </p>

        {/* CTA 버튼 영역 */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 ${
            showButtons
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          {/* 시작하기 버튼 */}
          <button
            onClick={() => navigate("/level-test")}
            className="flex items-center justify-center w-full sm:w-auto min-w-[200px] h-14 sm:h-16 
                       bg-white text-rose-500 font-semibold text-base sm:text-lg 
                       shadow-xl rounded-xl transition 
                       hover:bg-rose-100 hover:scale-105 active:scale-95"
          >
            {/* <GraduationCap className="w-5 h-5 mr-2" /> */}
            시작하기
          </button>

          {/* 로그인 버튼 */}
          <button
            onClick={handleQuickLogin}
            className="flex items-center justify-center w-full sm:w-auto min-w-[200px] h-14 sm:h-16 
                       bg-transparent border-2 border-white text-white font-semibold text-base sm:text-lg 
                       shadow-lg rounded-xl transition 
                       hover:bg-white/10 hover:scale-105 active:scale-95"
          >
            {/* <LogIn className="w-5 h-5 mr-2" /> */}
            로그인
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
