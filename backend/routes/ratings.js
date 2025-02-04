const express = require("express");
const RatingModel = require("../models/RatingModel");
const authenticate = require("../middlewares/auth");
const router = express.Router();

// dodanie oceny
router.post("/", authenticate, async (req, res) => {
  try {
    const { recipe_id, rating } = req.body;
    if (!recipe_id || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ error: "Nieprawidłowa ocena (1-5) lub brak ID przepisu" });
    }

    let userRating = await RatingModel.findOne({
      user_id: req.user.id,
      recipe_id,
    });

    if (userRating) {
      console.log("Aktualizacja oceny:", userRating);
      userRating.rating = rating;
      await userRating.save();
      return res.json({ message: "Ocena zaktualizowana", rating: userRating });
    }

    const newRating = new RatingModel({
      user_id: req.user.id,
      recipe_id,
      rating,
    });
    await newRating.save();

    res.status(201).json({ message: "Ocena dodana", rating: newRating });
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// pobranie średniej oceny
router.get("/average/:recipe_id", async (req, res) => {
  try {
    const ratings = await RatingModel.find({ recipe_id: req.params.recipe_id });

    if (ratings.length === 0) {
      return res.json({ average: 0, count: 0 });
    }

    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    const average = Number((sum / ratings.length).toFixed(1));
    res.json({ average, count: ratings.length });
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// pobranie oceny użytkownika
router.get("/:recipe_id", authenticate, async (req, res) => {
  try {
    const rating = await RatingModel.findOne({
      user_id: req.user.id,
      recipe_id: req.params.recipe_id,
    });

    if (!rating) {
      return res.json({ rating: null });
    }

    res.json(rating);
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// usunięcie oceny
router.delete("/:recipe_id", authenticate, async (req, res) => {
  try {
    const deletedRating = await RatingModel.findOneAndDelete({
      user_id: req.user.id,
      recipe_id: req.params.recipe_id,
    });

    if (!deletedRating) {
      return res
        .status(404)
        .json({ error: "Nie znaleziono oceny do usunięcia" });
    }

    res.json({ message: "Ocena została usunięta" });
  } catch (err) {
    console.error("Błąd usuwania oceny:", err.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

module.exports = router;
