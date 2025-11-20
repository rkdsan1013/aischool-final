// frontend/src/pages/MyPageProfile.tsx
import React, { useEffect, useRef, useState } from "react";
import { X, Camera, AlertTriangle, Check } from "lucide-react";
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
      // Use custom alert/toast in production instead of alert()
      console.error("새 비밀번호는 최소 8자 이상이어야 합니다.");
      return false;
    }
    if (passwords.new !== passwords.confirm) {
      console.error("새 비밀번호가 일치하지 않습니다.");
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
    <div className="h-[100dvh] bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-rose-500 text-white flex-shrink-0">
        {/* div에 justify-between을 추가하고 버튼을 하단으로 이동시킴 */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* 텍스트 영역 */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">개인정보 수정</h1>
            <p className="text-white/90 text-sm">프로필 정보를 관리하세요</p>
          </div>

          {/* 닫기 버튼 (우측) */}
          <button
            onClick={() => navigate(-1)}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition"
            aria-label="닫기" // aria-label 수정
            type="button"
          >
            <X className="w-5 h-5" /> {/* 아이콘 변경 */}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="w-full flex-1 overflow-y-auto">
        {/* Toast */}
        {showSuccessMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="font-semibold">저장되었습니다!</span>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Profile Image */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
            <header className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                프로필 사진
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                표시될 프로필 사진을 관리합니다.
              </p>
            </header>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                {/* 그라데이션 제거 -> bg-rose-500 단색으로 변경 */}
                <div className="w-32 h-32 rounded-full bg-rose-500 flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
                  {profile.profileImage ? (
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
                  className="absolute bottom-0 right-0 w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-rose-600 transition shadow-md border-2 border-white"
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
          <section className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
            <header className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                기본 정보
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                계정의 기본 정보를 수정합니다.
              </p>
            </header>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  이메일은 변경할 수 없습니다
                </p>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loadingSave}
                className="w-full mt-4 rounded-lg bg-rose-500 text-white px-4 py-3 text-sm font-semibold hover:bg-rose-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                type="button"
                aria-disabled={loadingSave}
              >
                {loadingSave ? "저장 중..." : "저장하기"}
              </button>
            </div>
          </section>

          {/* Password */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
            <header className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                비밀번호 변경
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                로그인 비밀번호를 새로 설정합니다.
              </p>
            </header>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords((s) => ({ ...s, current: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords((s) => ({ ...s, new: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords((s) => ({ ...s, confirm: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={loadingPwd}
                className="w-full mt-4 rounded-lg bg-rose-500 text-white px-4 py-3 text-sm font-semibold hover:bg-rose-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                type="button"
                aria-disabled={loadingPwd}
              >
                {loadingPwd ? "변경 중..." : "비밀번호 변경"}
              </button>
            </div>
          </section>

          {/* Delete Account */}
          <section className="bg-white rounded-lg border-2 border-rose-200 p-6 sm:p-8">
            <header className="mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-rose-600 mb-1 sm:mb-2">
                회원 탈퇴
              </h2>
            </header>

            <p className="text-sm text-gray-600 mb-4">
              회원 탈퇴 시 모든 학습 데이터가 삭제되며 복구할 수 없습니다.
            </p>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full rounded-lg border border-rose-500 px-4 py-3 bg-white text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
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
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full shadow-2xl">
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
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                type="button"
                autoFocus
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loadingDelete}
                className="flex-1 rounded-lg bg-rose-500 text-white px-4 py-3 text-sm font-semibold hover:bg-rose-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
