import { Pool } from "pg";

const connectionString =
  "postgresql://postgres:cMtLTczSWdnJecnctvMnDnPatDFDPmsv@postgres.railway.internal:5432/railway";

console.log("🔧 DATABASE_URL value:", connectionString);

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
