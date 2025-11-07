// src/pages/CreateRoomPage.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type FormState = {
  name: string;
  topic: string;
  maxParticipants: string;
  level: string;
  isPrivate: boolean;
};

// 간단한 인증 훅(프로덕션에서는 실제 인증 컨텍스트로 교체)
function useAuth() {
  const [isLoading] = useState<boolean>(false);
  const [user] = useState<{ id: string; name: string } | null>({
    id: "1",
    name: "TestUser",
  });
  return { user, isLoading };
}

const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  const [formData, setFormData] = useState<FormState>({
    name: "",
    topic: "",
    maxParticipants: "8",
    level: "전체",
    isPrivate: false,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500" />
      </div>
    );
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // TODO: 실제 방 생성 로직 추가
    navigate("/voiceroom");
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="bg-rose-500 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/voiceroom")}
            className="inline-flex items-center text-white hover:bg-white/20 px-2 py-1 rounded"
            aria-label="돌아가기"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="sr-only">돌아가기</span>
          </button>

          <h1 className="text-lg font-bold truncate">새로운 방 만들기</h1>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-4xl mx-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2 text-gray-900">방 설정</h2>
          <p className="text-sm text-gray-600 mb-6">
            다른 학습자들과 함께할 방을 만들어보세요
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 방 이름 */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-900"
              >
                방 이름
              </label>
              <input
                id="name"
                name="name"
                placeholder="예: 초보자 환영방"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>

            {/* 주제 */}
            <div className="space-y-2">
              <label
                htmlFor="topic"
                className="block text-sm font-medium text-gray-900"
              >
                주제
              </label>
              <input
                id="topic"
                name="topic"
                placeholder="예: 일상 대화 연습"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>

            {/* 최대 참여 인원 */}
            <div className="space-y-2">
              <label
                htmlFor="maxParticipants"
                className="block text-sm font-medium text-gray-900"
              >
                최대 참여 인원
              </label>
              <select
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={(e) =>
                  setFormData({ ...formData, maxParticipants: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                <option value="4">4명</option>
                <option value="6">6명</option>
                <option value="8">8명</option>
                <option value="10">10명</option>
                <option value="12">12명</option>
              </select>
            </div>

            {/* 권장 레벨 */}
            <div className="space-y-2">
              <label
                htmlFor="level"
                className="block text-sm font-medium text-gray-900"
              >
                권장 레벨
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                <option value="전체">전체</option>
                <option value="A1-A2">A1-A2 (초급)</option>
                <option value="A2-B1">A2-B1 (초중급)</option>
                <option value="B1-B2">B1-B2 (중급)</option>
                <option value="B2-C1">B2-C1 (중고급)</option>
                <option value="C1-C2">C1-C2 (고급)</option>
              </select>
            </div>

            {/* 비공개 방 */}
            <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
              <div className="space-y-0.5">
                <label
                  htmlFor="private"
                  className="block text-sm font-medium text-gray-900"
                >
                  비공개 방
                </label>
                <p className="text-sm text-gray-600">
                  초대받은 사람만 입장할 수 있습니다
                </p>
              </div>

              <button
                type="button"
                aria-pressed={formData.isPrivate}
                onClick={() =>
                  setFormData((p) => ({ ...p, isPrivate: !p.isPrivate }))
                }
                className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none ${
                  formData.isPrivate ? "bg-rose-500" : "bg-gray-200"
                }`}
                aria-label="비공개 토글"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    formData.isPrivate ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* fixed bottom button (원본과 동일한 위치: bottom-20) */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="w-full h-12 rounded-lg bg-rose-500 text-white text-lg font-semibold hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            방 만들기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPage;
