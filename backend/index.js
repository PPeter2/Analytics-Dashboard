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

// Αυτόματη δημιουργία του πίνακα χρηστών κατά την εκκίνηση
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
    console.log("🚀 [Database] Ο πίνακας 'users' είναι έτοιμος!");
  } catch (err) {
    console.error("❌ [Database] Σφάλμα αρχικοποίησης βάσης:", err);
  }
};
initDb();

// === 1. Endpoint για SIGN-UP (Εγγραφή) ===
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Παρακαλώ συμπληρώστε email και password" });
  }

  try {
    // Κρυπτογράφηση του password (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Αποθήκευση στη βάση δεδομένων
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    res.status(201).json({ message: "Η εγγραφή ολοκληρώθηκε επιτυχώς!", user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') { // Μοναδικό σφάλμα PostgreSQL για διπλότυπο email
      return res.status(400).json({ error: "Το email χρησιμοποιείται ήδη" });
    }
    res.status(500).json({ error: "Σφάλμα συστήματος κατά την εγγραφή" });
  }
});

// === 2. Endpoint για LOG-IN (Σύνδεση) ===
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Αναζήτηση χρήστη στη βάση
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Λάθος στοιχεία σύνδεσης" });
    }

    const user = userResult.rows[0];

    // Έλεγχος αν το password ταιριάζει με το κρυπτογραφημένο hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Λάθος στοιχεία σύνδεσης" });
    }

    // Δημιουργία ασφαλούς JWT Token διάρκειας 1 ώρας
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
