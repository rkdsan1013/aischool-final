import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/authRouter"; // ✅ 라우터 import

dotenv.config();

const app = express();

// ✅ CORS 설정: React 개발 서버 주소만 허용
app.use(
  cors({
    origin: "http://localhost:5173", // React dev server
    credentials: true, // 필요 시 쿠키/세션 허용
  })
);

app.use(express.json());

// ✅ 라우터 등록
app.use("/api/auth", authRouter);

// ✅ 포트 3000 고정
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
