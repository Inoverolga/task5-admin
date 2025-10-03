import { Pool } from "pg";

console.log("🔧 Environment variables:", Object.keys(process.env));
console.log("🔧 DB_CONNECTION_STRING:", process.env.DB_CONNECTION_STRING);

const connectionString = process.env.DB_CONNECTION_STRING || "not-set";

console.log("🔧 Final connection string:", connectionString);

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
});

const checkDB = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    console.log("✅ Database connected at:", result.rows[0].now);
    client.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
};

checkDB();

export default pool;
