import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Globe, Lock, Plus, TrendingUp } from "lucide-react";

interface Room {
  id: string;
  name: string;
  topic: string;
  host: string;
  participants: number;
  maxParticipants: number;
  level: string;
  isPrivate: boolean;
  language: string;
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
        language: "English",
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
        language: "English",
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
        language: "English",
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
        language: "English",
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
        language: "English",
      },
    ]);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
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
    <div className="min-h-screen bg-white pb-24 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600 text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">VoiceRoom</h1>
          <p className="text-white/90">실시간으로 다른 학습자들과 대화하세요</p>
        </div>
      </div>

      {/* Create Room Button */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <button
          onClick={handleCreateRoom}
          className="w-full h-14 bg-rose-500 text-white text-lg font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-rose-600 transition mb-6"
        >
          <Plus className="w-5 h-5" />
          새로운 방 만들기
        </button>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <Globe className="w-8 h-8 mx-auto mb-2 text-rose-400" />
            <p className="text-2xl font-bold">{rooms.length}</p>
            <p className="text-sm text-gray-500">활성 방</p>
          </div>
        </div>

        {/* Room List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">활성 방 목록</h2>
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl border shadow-sm hover:shadow-lg hover:scale-[1.01] transition cursor-pointer"
            >
              <div className="p-4 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">{room.name}</h3>
                      {room.isPrivate && (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{room.topic}</p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    {room.level}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>
                        {room.participants}/{room.maxParticipants}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span>{room.language}</span>
                    </div>
                  </div>
                  <span>호스트: {room.host}</span>
                </div>
                <button
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={room.participants >= room.maxParticipants}
                  className={`w-full h-10 rounded-lg font-medium text-sm ${
                    room.participants >= room.maxParticipants
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-rose-500 text-white hover:bg-rose-600 transition"
                  }`}
                >
                  {room.participants >= room.maxParticipants
                    ? "방이 가득 찼습니다"
                    : "입장하기"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
