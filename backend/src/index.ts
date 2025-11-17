import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRouter";
import userRouter from "./routes/userRouter";
import trainingRouter from "./routes/trainingRouter";

dotenv.config();

const app = express();

app.use(cookieParser());
app.use(express.json());

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

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
