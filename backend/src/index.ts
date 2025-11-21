import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRouter";
import userRouter from "./routes/userRouter";
import trainingRouter from "./routes/trainingRouter";
import aiTalkRoutes from "./routes/aiTalkRouter";
import aiRouter from "./ai/router";

dotenv.config();

const app = express();

app.use(cookieParser());

// --- [핵심 수정] ---
// 오디오/이미지 등 대용량 데이터 전송을 위해 용량 제한을 50mb로 상향 (기본값 100kb)
// 이 설정이 없으면 오디오 데이터가 중간에 잘려서 'corrupted file' 오류가 발생합니다.
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// CORS 설정: React dev server만 허용, credentials 허용
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 라우터 등록
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/training", trainingRouter);
app.use("/api/ai-talk", aiTalkRoutes);

// app.use("/api/ai", aiRouter);

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
