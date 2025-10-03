import { Pool } from "pg";

console.log("🔧 DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
console.log("🔧 NODE_ENV:", process.env.NODE_ENV);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

pool.on("connect", () => {
  console.log("✅ Database connected successfully");
});

pool.on("error", (err) => {
  console.error("❌ Database connection error:", err);
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("📊 Database connection test: SUCCESS");
    client.release();
  } catch (error) {
    console.error("📊 Database connection test: FAILED", error.message);
  }
};

testConnection();

export default pool;
