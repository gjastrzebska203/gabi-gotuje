const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");
const authenticate = require("../middlewares/auth");
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

// edycja własnego konta
router.put("/me", authenticate, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Brak tokenu autoryzacyjnego" });
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(verified.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Użytkownik nie istnieje" });
    }

    if (username) user.username = username;
    if (email) user.email = email;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: "Dane konta zaktualizowane pomyślnie" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// pobranie wszystkich użytkowników
router.get("/", async (req, res) => {
  try {
    const users = await UserModel.find().select("_id username email role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// pobranie szczegółów użytkownika o id
router.get("/:id", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ error: "Użytkownik nie znaleziony" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// usunięcie użytkownika
router.delete("/me", authenticate, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Użytkownik nie znaleziony" });
    }

    await user.deleteOne();
    res.status(204).json({ message: "Konto zostało usunięte" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
