const cors = require("cors");
const express = require("express");
const app = express();
const port = 3000;
app.use(cors());

const { Recipe, User, Comment } = require("./app");

app.use(express.json());

// nowy użytkownik
app.post("/users", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const role = req.body.role;
  if (!username || !email || !password || !role) {
    console.log({ error: "Missing user data" });
    res.status(404).json({ error: "Enter user data" });
  } else {
    const newUser = new User(username, email, password, role);
    const message = `New user created: ${newUser.username}, ${newUser.email}, ${newUser.password}, ${newUser.role}`;
    console.log(message);
    res.status(201).json({
      message: message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
