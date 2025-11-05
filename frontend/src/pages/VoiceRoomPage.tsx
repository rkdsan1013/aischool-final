import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Lock, Plus, Radio, Sparkles } from "lucide-react";

interface Room {
  id: string;
  name: string;
  topic: string;
  host: string;
  participants: number;
  maxParticipants: number;
  level: string;
  isPrivate: boolean;
}

export default function VoiceRoomPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>({
    name: "홍길동",
    email: "test@test.com",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    setRooms([
      {
        id: "1",
        name: "초보자 환영방",
        topic: "일상 대화 연습",
        host: "김영희",
        participants: 4,
        maxParticipants: 8,
        level: "A1-A2",
        isPrivate: false,
      },
      {
        id: "2",
        name: "비즈니스 영어",
        topic: "회의 표현 연습",
        host: "이철수",
        participants: 6,
        maxParticipants: 10,
        level: "B2-C1",
        isPrivate: false,
      },
      {
        id: "3",
        name: "여행 영어",
        topic: "공항/호텔 상황 연습",
        host: "박민수",
        participants: 3,
        maxParticipants: 6,
        level: "A2-B1",
        isPrivate: false,
      },
      {
        id: "4",
        name: "프리토킹",
        topic: "자유 주제 대화",
        host: "최지은",
        participants: 8,
        maxParticipants: 12,
        level: "B1-B2",
        isPrivate: false,
      },
      {
        id: "5",
        name: "발음 교정실",
        topic: "발음 집중 연습",
        host: "정수진",
        participants: 2,
        maxParticipants: 5,
        level: "전체",
        isPrivate: false,
      },
    ]);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleJoinRoom = (roomId: string) => {
    navigate(`/voiceroom/room/${roomId}`);
  };

  const handleCreateRoom = () => {
    navigate("/voiceroom/create");
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-rose-50 to-white border-b border-rose-100">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full text-xs sm:text-sm font-medium mb-1 sm:mb-2">
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>실시간 음성 채팅</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              함께 대화하며
              <br />
              <span className="text-rose-500">실력을 키워보세요</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-2">
              전 세계 학습자들과 실시간으로 연결되어 자연스러운 대화를 나누고
              언어 실력을 향상시키세요
            </p>
          </div>

          <button
            onClick={handleCreateRoom}
            className="w-full max-w-md mx-auto flex items-center justify-center gap-2 sm:gap-3 h-12 sm:h-14 bg-rose-500 text-white text-base sm:text-lg font-semibold rounded-xl hover:bg-rose-600 transition-all active:scale-[0.98] shadow-lg shadow-rose-500/25"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            새로운 방 만들기
          </button>
        </div>
      </div>

      {/* Room List Section */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
              활성 방 목록
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              지금 {rooms.length}개의 방에서 대화가 진행 중입니다
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
            <span>실시간 업데이트</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {rooms.map((room, index) => (
            <div
              key={room.id}
              className="group bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6 hover:border-rose-200 hover:shadow-xl transition-all duration-300 active:scale-[0.99] sm:hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Room Header */}
              <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-rose-500 transition-colors truncate">
                      {room.name}
                    </h3>
                    {room.isPrivate && (
                      <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed line-clamp-2">
                    {room.topic}
                  </p>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs sm:text-sm font-semibold flex-shrink-0">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {room.level}
                </div>
              </div>

              {/* Room Stats */}
              <div className="flex items-center gap-4 sm:gap-6 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(room.participants, 3))].map((_, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs sm:text-sm">
                    <span className="font-semibold text-gray-900">
                      {room.participants}
                    </span>
                    <span className="text-gray-500">
                      /{room.maxParticipants}
                    </span>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">
                  호스트:{" "}
                  <span className="font-semibold text-gray-900">
                    {room.host}
                  </span>
                </div>
              </div>

              {/* Join Button */}
              <button
                onClick={() => handleJoinRoom(room.id)}
                disabled={room.participants >= room.maxParticipants}
                className={`w-full h-11 sm:h-12 rounded-xl font-semibold text-sm sm:text-base transition-all ${
                  room.participants >= room.maxParticipants
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-rose-500 text-white hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-500/25 active:scale-[0.98]"
                }`}
              >
                {room.participants >= room.maxParticipants
                  ? "방이 가득 찼습니다"
                  : "입장하기"}
              </button>
            </div>
          ))}
        </div>

        {/* Empty State (if no rooms) */}
        {rooms.length === 0 && (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Users className="w-7 h-7 sm:w-8 sm:h-8 text-rose-500" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              아직 활성화된 방이 없습니다
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              첫 번째 방을 만들어 대화를 시작해보세요!
            </p>
            <button
              onClick={handleCreateRoom}
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-rose-500 text-white text-sm sm:text-base font-semibold rounded-xl hover:bg-rose-600 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />방 만들기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
