const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'securepassword123',
  database: process.env.DB_NAME || 'auth_system',
  port: 5432,
});

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("[Database] User's table is ready");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS request_metrics (
        id SERIAL PRIMARY KEY,
        method VARCHAR(10) NOT NULL,
        path VARCHAR(255) NOT NULL,
        status_code INT NOT NULL,
        duration_ms REAL NOT NULL,
        error_detail TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("[Database] The table request_metrics is ready");
  } catch (err) {
    console.error("[Database] Database error:", err);
  }
};
initDb();

const persistRequestMetric = async (metric) => {
  try {
    await pool.query(
      `INSERT INTO request_metrics (method, path, status_code, duration_ms, error_detail) 
       VALUES ($1, $2, $3, $4, $5)`,
      [metric.method, metric.path, metric.statusCode, metric.durationMs, metric.errorDetail]
    );
  } catch (err) {
    console.error("[Metrics DB Error] Αποτυχία αποθήκευσης μετρικών:", err.message);
  }
};

const metricsMiddleware = (req, res, next) => {
  const t0 = performance.now();
  if (req.path.startsWith('/api/')) {
    const originalSend = res.send;
    let errorDetail = null;

    res.send = function (body) {
      if (res.statusCode >= 400 && body) {
        try {
          const data = typeof body === 'string' ? JSON.parse(body) : body;
          errorDetail = String(data.detail || data.error || String(body).substring(0, 300));
        } catch (e) {
          errorDetail = String(body).substring(0, 300);
        }
      }
      res.send = originalSend;
      return res.send.apply(this, arguments);
    };

    res.on('finish', () => {
      const durationMs = performance.now() - t0;
      
      const metricPayload = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
        errorDetail: errorDetail
      };
      console.log(`[Metric Log] ${metricPayload.method} ${metricPayload.path} - Status: ${metricPayload.statusCode} - Time: ${metricPayload.durationMs}ms`);
      persistRequestMetric(metricPayload);
    });
  }

  next();
};

app.use(metricsMiddleware);

app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Please add your email and password" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    res.status(201).json({ message: "Succesfully created account", user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') { 
      return res.status(400).json({ error: "This email is already used" });
    }
    res.status(500).json({ error: "System failure" });
  }
});


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Wrong Information "});
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Wrong Information" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'my_super_secret_key_98765',
      { expiresIn: '1h' }
    );

    res.json({ message: "Succesfully logged in", token });
  } catch (err) {
    res.status(500).json({ error: "System Failure while trying to login" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Backend] Server started succefully in port: ${PORT}`);
});
