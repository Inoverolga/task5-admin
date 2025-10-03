import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/database.js";
import { Resend } from "resend";

const router = express.Router();

const checkUser = async (req, res, next) => {
  if (
    req.path === "/login" ||
    req.path === "/register" ||
    req.path.startsWith("/verify/")
  ) {
    return next();
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Authorization required" });
    }

    const decoded = jwt.verify(token, "secret-key");
    const user = await db.query("SELECT id, status FROM users WHERE id = $1", [
      decoded.userId,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.rows[0].status === "blocked" && req.method !== "GET") {
      return res.status(403).json({ error: "Your account has been blocked" });
    }
    req.user = user.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
router.use(checkUser);

router.get("/all-users", async (req, res) => {
  try {
    const { sort, order } = req.query;
    console.log("Sort params:", sort, order);

    let orderBy = "last_login_time DESC";

    if (sort && order) {
      const sortFieldMap = {
        lastLogin: "last_login_time",
        registrationTime: "registration_time",
        name: "name",
        email: "email",
        status: "status",
      };

      const sqlField = sortFieldMap[sort] || "last_login_time";
      const sqlOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";
      orderBy = `${sqlField} ${sqlOrder}`;
    }

    const result = await db.query(`
      SELECT
        id,
        name,
        email,
        status,
        last_login_time as "lastLogin",
        registration_time as "registrationTime"
      FROM users
      ORDER BY ${orderBy}
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (name, email, password_hash, status, registration_time) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name, email, hashedPassword, "unverified", new Date()]
    );

    sendVerificationEmail(email, result.rows[0].id);
    res.status(201).json({
      message: "User successfully registered",
      userId: result.rows[0].id,
    });
  } catch (error) {
    if (error.code === "23505") {
      res.status(400).json({ error: "Email already in use" });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      "SELECT id, password_hash, name, status, email FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Неверный email или пароль" });
    }

    const user = result.rows[0];

    if (user.status === "blocked") {
      return res.status(400).json({ error: "Account blocked" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: "Неверный email или пароль" });
    }

    await db.query("UPDATE users SET last_login_time = $1 WHERE id = $2", [
      new Date(),
      user.id,
    ]);

    const token = jwt.sign({ userId: user.id }, "secret-key", {
      expiresIn: "24h",
    });

    res.json({
      message: "Вход выполнен успешно",
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/logout", (req, res) => {
  res.json({ message: "Выход выполнен" });
});

router.delete("/users", async (req, res) => {
  try {
    const { userIds } = req.body;
    await db.query("DELETE FROM users WHERE id = ANY($1)", [userIds]);

    res.json({
      message: "✅Users deleted successfully",
      deletedCount: userIds.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка удаления пользователей" });
  }
});

router.post("/users/block", async (req, res) => {
  try {
    const { userIds } = req.body;
    await db.query("UPDATE users SET status = 'blocked' WHERE id = ANY($1)", [
      userIds,
    ]);
    res.json({
      message: "❌ Users blocked successfully",
      blockedCount: userIds.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка блокировки пользователей" });
  }
});

router.post("/users/unblock", async (req, res) => {
  try {
    const { userIds } = req.body;
    await db.query("UPDATE users SET status = 'active' WHERE id = ANY($1)", [
      userIds,
    ]);

    res.json({
      message: "✅ Users unblocked successfully",
      unblockedCount: userIds.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка разблокировки пользователей" });
  }
});

router.get("/verify/:userId", async (req, res) => {
  try {
    await db.query(
      "UPDATE users SET status = $1 WHERE id = $2 AND status = $3",
      ["active", req.params.userId, "unverified"]
    );

    res.send(`
      <html>
        <body>
          <h2>✅ Email подтвержден</h2>
          <p>Перенаправление в приложение...</p>
          <script>
            setTimeout(() => {
              // ✅ ИСПРАВЬТЕ НА PRODUCTION FRONTEND
              window.location.href = "https://task5-admin.netlify.app/#/login?message=Email verified successfully";
            }, 2000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("Ошибка подтверждения email");
  }
});

const resend = new Resend("re_97Zpz93y_HWSPApSmfVZN1WVMFPTzJsts");

async function sendVerificationEmail(email, userId) {
  try {
    console.log(`📧 Sending verification email to: ${email}`);

    const verificationLink = `https://task5-admin-production.up.railway.app/api/auth/verify/${userId}`;

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify Your Account - THE APP",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Verify Your Email Address</h2>
          <p>Click the link below to verify your account:</p>
          <a href="${verificationLink}" style="color: blue;">Verify Email</a>
          <p>Or copy this link: ${verificationLink}</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Resend error:", error);
      return;
    }
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
}

export default router;
