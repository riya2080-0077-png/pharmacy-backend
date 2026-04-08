const express = require("express");
const { Pool } = require("pg");
const app = express();

app.use(express.urlencoded({ extended: true }));// (Using this line so that express can understand the incoming data)

const PORT = 8000;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "example",
  password: "1234",
  port: 5432,
});

pool.connect()
  .then(() => console.log("PostgreSQL connected successfully"))
  .catch((err) => console.error("Connection error:", err.message));

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/signup", (req, res) => {
  res.send(`
    <h1>Signup Page</h1>
    <form method="POST" action="/signup">
      <input type="text" name="username" placeholder="Enter your username" required />
      <br><br>
      <input type="email" name="email" placeholder="Enter your email" required />
      <br><br>
      <input type="password" name="password" placeholder="Enter your password" required />
      <br><br>
      <button type="submit">Sign Up</button>
    </form>
  `);
});

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  console.log("Form data:", username, email, password);

  try {
    await pool.query(
      "INSERT INTO backend_users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, password]
    );

    res.send("User saved in database successfully");
  } catch (err) {
    console.error("DB ERROR:", err.message);
    res.send("Error saving user data to the database");
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});