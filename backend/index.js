const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Επιτρέπει στο React frontend να στέλνει αιτήματα

// Σύνδεση με την PostgreSQL του Docker (τραβάει τις ρυθμίσεις από το docker-compose)
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'securepassword123',
  database: process.env.DB_NAME || 'auth_system',
  port: 5432,
});

// Αυτόματη δημιουργία των πινάκων χρηστών και μετρικών κατά την εκκίνηση
const initDb = async () => {
  try {
    // Δημιουργία πίνακα χρηστών
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("🚀 [Database] Ο πίνακας 'users' είναι έτοιμος!");

    // Δημιουργία πίνακα για τα metrics (αντίστοιχο του Python persist_request_metric)
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
    console.log("📊 [Database] Ο πίνακας 'request_metrics' είναι έτοιμος!");
  } catch (err) {
    console.error("❌ [Database] Σφάλμα αρχικοποίησης βάσης:", err);
  }
};
initDb();

// === ΣΥΝΑΡΤΗΣΗ ΑΠΟΘΗΚΕΥΣΗΣ ΜΕΤΡΙΚΩΝ ΣΤΗ ΒΑΣΗ ===
const persistRequestMetric = async (metric) => {
  try {
    await pool.query(
      `INSERT INTO request_metrics (method, path, status_code, duration_ms, error_detail) 
       VALUES ($1, $2, $3, $4, $5)`,
      [metric.method, metric.path, metric.statusCode, metric.durationMs, metric.errorDetail]
    );
  } catch (err) {
    console.error("❌ [Metrics DB Error] Αποτυχία αποθήκευσης μετρικών:", err.message);
  }
};

// === MIDDLEWARE ΜΕΤΡΙΚΩΝ (METRICS MIDDLEWARE) ===
const metricsMiddleware = (req, res, next) => {
  const t0 = performance.now();

  // Καταγραφή μόνο αν το path ξεκινάει από /api/
  if (req.path.startsWith('/api/')) {
    const originalSend = res.send;
    let errorDetail = null;

    // Παρακολούθηση του response body για την εξαγωγή σφαλμάτων
    res.send = function (body) {
      if (res.statusCode >= 400 && body) {
        try {
          // Έλεγχος αν είναι stringified JSON ή ήδη αντικείμενο
          const data = typeof body === 'string' ? JSON.parse(body) : body;
          // Ψάχνει για 'detail' (τύπου FastAPI) ή 'error' (τύπου Express)
          errorDetail = String(data.detail || data.error || String(body).substring(0, 300));
        } catch (e) {
          errorDetail = String(body).substring(0, 300);
        }
      }
      res.send = originalSend;
      return res.send.apply(this, arguments);
    };

    // Όταν ολοκληρωθεί η απάντηση στον client, υπολόγισε χρόνο και αποθήκευσε
    res.on('finish', () => {
      const durationMs = performance.now() - t0;
      
      const metricPayload = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)), // Στρογγυλοποίηση σε 2 δεκαδικά
        errorDetail: errorDetail
      };

      // 1. Εκτύπωση στην κονσόλα (ισοδύναμο του req_metrics.record)
      console.log(`📊 [Metric Log] ${metricPayload.method} ${metricPayload.path} - Status: ${metricPayload.statusCode} - Time: ${metricPayload.durationMs}ms`);
      
      // 2. Αποθήκευση στην PostgreSQL
      persistRequestMetric(metricPayload);
    });
  }

  next();
};

// === ΕΝΕΡΓΟΠΟΙΗΣΗ MIDDLEWARE ===
// Πρέπει να μπει ΠΡΙΝ από τα endpoints για να μπορεί να τα καταγράψει όλα!
app.use(metricsMiddleware);


// === 1. Endpoint για SIGN-UP (Εγγραφή) ===
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Παρακαλώ συμπληρώστε email και password" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    res.status(201).json({ message: "Η εγγραφή ολοκληρώθηκε επιτυχώς!", user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') { 
      return res.status(400).json({ error: "Το email χρησιμοποιείται ήδη" });
    }
    res.status(500).json({ error: "Σφάλμα συστήματος κατά την εγγραφή" });
  }
});


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Λάθος στοιχεία σύνδεσης" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Λάθος στοιχεία σύνδεσης" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'my_super_secret_key_98765',
      { expiresIn: '1h' }
    );

    res.json({ message: "Επιτυχής σύνδεση!", token });
  } catch (err) {
    res.status(500).json({ error: "Σφάλμα συστήματος κατά τη σύνδεση" });
  }
});

// Εκκίνηση του Server στη θύρα 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🌐 [Backend] Ο server τρέχει μόνιμα στη θύρα ${PORT}`);
});
