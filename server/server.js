import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import pool from "./config/database.js";

const app = express();

app.use(
  cors({
    origin: ["https://task5-admin.netlify.app", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working! ✅" });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    res.json({
      message: "Database connection successful ✅",
      time: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Database connection failed ❌",
      details: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
