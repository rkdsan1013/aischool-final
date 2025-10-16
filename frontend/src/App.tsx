export default function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800 px-6">
      {/* 헤더 */}
      <header className="w-full max-w-md text-center mb-12">
        <h1 className="text-4xl font-bold text-rose-500">Blabla</h1>
        <p className="mt-4 text-lg text-gray-600">Stop typing, Start talking</p>
      </header>

      {/* CTA 버튼 */}
      <main className="w-full max-w-sm flex flex-col gap-4">
        <button className="w-full py-3 rounded-lg bg-rose-500 text-white font-semibold shadow hover:bg-rose-600 transition">
          시작하기
        </button>
        <button className="w-full py-3 rounded-lg border border-rose-500 text-rose-500 font-semibold hover:bg-rose-50 transition">
          더 알아보기
        </button>
      </main>

      {/* 푸터 */}
      <footer className="mt-16 text-sm text-gray-400">
        © 2025 Blabla. All rights reserved.
      </footer>
    </div>
  );
}
