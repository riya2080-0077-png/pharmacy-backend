
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

//get signup
//post signup


//yeta bata chai login ko kaam suru huncha 
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query( //This line is related to Authentication .
      "SELECT * FROM backend_users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length > 0) {
    const user = result.rows[0];

if (user.role === "pharmacy_owner") {
  res.redirect("/pharmacy-dashboard");
} else {
  res.redirect("/user-dashboard");
}
    } else {
      res.send("Invalid email or password ❌");
    }

  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    res.send("Error during login");
  }
});

//Now we are creating a route for admin dashboard
app.get("/user-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "user-dashboard.html"));
});

app.get("/pharmacy-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "pharmacy-dashboard.html"));
});

//Pharmacy entity html


app.get("/pharmacy", (req, res) => {
  res.sendFile(path.join(__dirname, "pharmacy.html"));
});

app.post("/pharmacy", async (req, res) => {
  const { pharmacy_name, location, contact_number, user_id } = req.body;

  try {
    await pool.query(
      "INSERT INTO pharmacy (pharmacy_name, location, contact_number, user_id) VALUES ($1, $2, $3, $4)",
      [pharmacy_name, location, contact_number, user_id]
    );

    res.send("Pharmacy saved successfully ✅");
  } catch (err) {
    console.error("PHARMACY ERROR:", err.message);
    res.send("Error saving pharmacy ❌");
  }
});
 
//Yesma hami Add medicine ko route banauchaun

app.get("/add-medicine", (req, res) => {
  res.sendFile(path.join(__dirname, "add-medicine.html"));
});

app.post("/add-medicine", async (req, res) => {
  const { medicine_name, price, stock, pharmacy_id } = req.body;

  try {
    await pool.query(
      "INSERT INTO medicine (medicine_name, price, stock, pharmacy_id) VALUES ($1, $2, $3, $4)",
      [medicine_name, price, stock, pharmacy_id]
    );

    res.send("Medicine added successfully ✅");

  } catch (err) {
    console.error("MEDICINE ERROR:", err.message);
    res.send("Error adding medicine ❌");
  }
});


// giving direction and telling only the owner of the pharmacy to see the medicine data of his pharmacy
app.get("/owner-medicines-data", async (req, res) => {
  try {
    const result = await pool.query(
  "SELECT * FROM medicine"
);
    

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.send("Error fetching medicines");
  }
});

app.get("/owner-medicines", (req, res) => {
  res.sendFile(path.join(__dirname, "owner-medicines.html"));
});

// this route is for deleting the medicine data from the database
app.get("/delete-medicine/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await pool.query(
      "DELETE FROM medicine WHERE medicine_id = $1",
      [id]
    );

    res.redirect("/owner-medicines");

  } catch (err) {
    console.error(err);
    res.send("Error deleting medicine");
  }
});

//Update the get medicine data from the database
app.get("/update-medicine/:id", async (req, res) => {
  const id = req.params.id;

  const result = await pool.query(
    "SELECT * FROM medicine WHERE medicine_id = $1",
    [id]
  );

  const medicine = result.rows[0];

  res.send(`
    <h2>Update Medicine</h2>

    <form method="POST" action="/update-medicine/${id}">
      <input type="text" name="medicine_name" value="${medicine.medicine_name}" /><br><br>
      <input type="number" name="price" value="${medicine.price}" /><br><br>
      <input type="number" name="stock" value="${medicine.stock}" /><br><br>

      <button type="submit">Update</button>
    </form>
  `);
});

//UPDATE POST ROUTE
app.post("/update-medicine/:id", async (req, res) => {
  const id = req.params.id;
  const { medicine_name, price, stock } = req.body;

  await pool.query(
    "UPDATE medicine SET medicine_name=$1, price=$2, stock=$3 WHERE medicine_id=$4",
    [medicine_name, price, stock, id]
  );

  res.redirect("/owner-medicines");
});


app.listen(PORT, () => { // hamro server suru huncha ani baki route chai jaile yeako mathi na huncha 
  console.log(`Server started on port ${PORT}`);
});