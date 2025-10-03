import { Pool } from "pg";

const connectionString =
  process.env.DB_CONNECTION_STRING || process.env.DATABASE_URL;

console.log("🔧 Connection string:", connectionString ? "SET" : "NOT SET");

if (!connectionString) {
  throw new Error("Database connection string is not set!");
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log("✅ Database connected successfully");
});

pool.on("error", (err) => {
  console.error("❌ Database connection error:", err);
});

export default pool;
