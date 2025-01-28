const express = require("express");
const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

// rejestracja
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Wszystkie pola są wymagane" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Użytkownik z tym adresem email już istnieje" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new UserModel({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "Rejestracja zakończona sukcesem" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// logowanie
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Wszystkie pola są wymagane" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Nieprawidłowy email lub hasło" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Nieprawidłowy email lub hasło" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({ message: "Zalogowano pomyślnie", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// szczegóły użytkownika: token
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Brak tokenu autoryzacyjnego" });
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(verified.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Użytkownik nie istnieje" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
