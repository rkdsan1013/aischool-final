import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  User,
  Lock,
  AlertTriangle,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type ProfileState = {
  name: string;
  email: string;
  profileImage: string | null;
};

type PasswordState = {
  current: string;
  new: string;
  confirm: string;
};

const MyPageProfile: React.FC = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileState>({
    name: "홍길동",
    email: "test@test.com",
    profileImage: null,
  });

  const [passwords, setPasswords] = useState<PasswordState>({
    current: "",
    new: "",
    confirm: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const fileUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (fileUrlRef.current) {
        URL.revokeObjectURL(fileUrlRef.current);
        fileUrlRef.current = null;
      }
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileUrlRef.current) {
      URL.revokeObjectURL(fileUrlRef.current);
    }

    const objUrl = URL.createObjectURL(file);
    fileUrlRef.current = objUrl;
    setProfile((p) => ({ ...p, profileImage: objUrl }));
  };

  const mockApi = (ms = 700) => new Promise((res) => setTimeout(res, ms));

  const handleSaveProfile = async () => {
    if (loadingSave) return;
    setLoadingSave(true);
    try {
      // TODO: Replace with real API call for profile save (multipart if uploading)
      await mockApi();
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } finally {
      setLoadingSave(false);
    }
  };

  const validateNewPassword = (): boolean => {
    if (passwords.new.length < 8) {
      alert("새 비밀번호는 최소 8자 이상이어야 합니다.");
      return false;
    }
    if (passwords.new !== passwords.confirm) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return false;
    }
    return true;
  };

  const handleChangePassword = async () => {
    if (loadingPwd) return;
    if (!validateNewPassword()) return;
    setLoadingPwd(true);
    try {
      // TODO: Replace with real password-change API call
      await mockApi();
      setPasswords({ current: "", new: "", confirm: "" });
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } finally {
      setLoadingPwd(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (loadingDelete) return;
    setLoadingDelete(true);
    try {
      // TODO: Replace with real delete API call
      await mockApi();
      setShowDeleteModal(false);
      navigate("/", { replace: true });
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              aria-label="뒤로가기"
              type="button"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                개인정보 수정
              </h1>
              <p className="text-sm text-gray-600">프로필 정보를 관리하세요</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {/* Toast */}
        {showSuccessMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-green-500 text-white px-6 py-3 rounded-xl shadow-md flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="font-semibold">저장되었습니다!</span>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Profile Image */}
          <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
              프로필 사진
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
                  {profile.profileImage ? (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img
                      src={profile.profileImage}
                      alt="프로필 이미지"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span aria-hidden>{profile.name?.charAt(0) ?? "?"}</span>
                  )}
                </div>

                <label
                  className="absolute bottom-0 right-0 w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-rose-600 transition shadow-md"
                  aria-label="프로필 이미지 업로드"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    aria-hidden="true"
                  />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm text-gray-600 mb-2">
                  프로필 사진을 변경하려면 카메라 아이콘을 클릭하세요
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG 형식 / 최대 5MB
                </p>
              </div>
            </div>
          </section>

          {/* Basic Info */}
          <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              기본 정보
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  이름
                </label>
                <input
                  id="name"
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none transition"
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  이메일은 변경할 수 없습니다
                </p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loadingSave}
                className={`w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${
                  loadingSave ? "" : "hover:from-rose-600 hover:to-pink-600"
                }`}
                type="button"
                aria-disabled={loadingSave}
              >
                {loadingSave ? "저장 중..." : "저장하기"}
              </button>
            </div>
          </section>

          {/* Password */}
          <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              비밀번호 변경
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords((s) => ({ ...s, current: e.target.value }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none transition"
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords((s) => ({ ...s, new: e.target.value }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none transition"
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords((s) => ({ ...s, confirm: e.target.value }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none transition"
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={loadingPwd}
                className={`w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${
                  loadingPwd ? "" : "hover:from-rose-600 hover:to-pink-600"
                }`}
                type="button"
                aria-disabled={loadingPwd}
              >
                {loadingPwd ? "변경 중..." : "비밀번호 변경"}
              </button>
            </div>
          </section>

          {/* Delete Account */}
          <section className="bg-white rounded-xl shadow-md border-2 border-rose-200 p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-rose-600 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              회원 탈퇴
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              회원 탈퇴 시 모든 학습 데이터가 삭제되며 복구할 수 없습니다.
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full px-6 py-3 bg-white border-2 border-rose-500 text-rose-600 font-semibold rounded-xl hover:bg-rose-50 transition"
              type="button"
            >
              회원 탈퇴하기
            </button>
          </section>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>

            <h3
              id="delete-title"
              className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-2"
            >
              정말 탈퇴하시겠습니까?
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              모든 학습 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
                type="button"
                autoFocus
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loadingDelete}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-rose-700 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                type="button"
                aria-disabled={loadingDelete}
              >
                {loadingDelete ? "탈퇴 진행중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPageProfile;
