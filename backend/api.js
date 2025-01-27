const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const { Recipe, User, Comment } = require("./app");

mongoose
  .connect(
    "mongodb+srv://gjastrzebska203:uN1iAzECQYbE7Mgz@gabigotuje.pqcjg.mongodb.net/"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  created_at: { type: Date, default: Date.now },
});

const UserModel = mongoose.model("User", userSchema);

// dodanie użytkownika
app.post("/users", async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing user data" });
  }
  try {
    const newUser = new UserModel({ username, email, password, role });
    await newUser.save();
    console.log("User saved:", newUser);
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error saving user to the database" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// const cors = require("cors");
// const express = require("express");
// const app = express();
// const port = 3000;
// app.use(cors());

// const { Recipe, User, Comment } = require("./app");

// app.use(express.json());

// // nowy użytkownik
// app.post("/users", (req, res) => {
//   const username = req.body.username;
//   const email = req.body.email;
//   const password = req.body.password;
//   const role = req.body.role;
//   if (!username || !email || !password || !role) {
//     console.log({ error: "Missing user data" });
//     res.status(404).json({ error: "Enter user data" });
//   } else {
//     const newUser = new User(username, email, password, role);
//     const message = `New user created: ${newUser.username}, ${newUser.email}, ${newUser.password}, ${newUser.role}`;
//     console.log(message);
//     res.status(201).json({
//       message: message,
//     });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });
