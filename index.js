const express = require("express");
const { Pool } = require("pg");
const app = express();
const path = require("path");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

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
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.post("/signup", async (req, res) => {
  const { username, email, password, role } = req.body;

  console.log("Form data:", username, email, password, role);

  try {
    await pool.query(
      "INSERT INTO backend_users (username, email, password, role) VALUES ($1, $2, $3, $4)",
      [username, email, password, role]
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