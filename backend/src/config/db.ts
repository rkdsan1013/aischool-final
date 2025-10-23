import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // ✅ .env 파일 로딩

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  port: parseInt(process.env.DB_PORT ?? ""),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "aischool",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
} satisfies mysql.PoolOptions); // ✅ 타입 보장
