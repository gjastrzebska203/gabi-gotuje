const express = require("express");
const RatingModel = require("../models/RatingModel");
const RecipeModel = require("../models/RecipeModel");
const authenticate = require("../middlewares/auth");
const { default: mongoose } = require("mongoose");
const router = express.Router();

// dodanie oceny
router.post("/", authenticate, async (req, res) => {
  try {
    const { recipe_id, rating } = req.body;

    if (!recipe_id || !rating) {
      return res
        .status(400)
        .json({ error: "Pola recipe_id i rating są wymagane" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ error: "Ocena musi być w przedziale od 1 do 5" });
    }

    const recipe = await RecipeModel.findById(recipe_id);
    if (!recipe) {
      return res.status(400).json({ error: "Przepis nie został znaleziony" });
    }

    const existingRating = await RatingModel.findOne({
      recipe_id,
      user_id: req.user.id,
    });
    if (existingRating) {
      return res.status(400).json({ error: "Już oceniono ten przepis" });
    }

    const newRating = new RatingModel({
      user_id: req.user.id,
      recipe_id,
      rating,
    });

    await newRating.save();
    res.status(201).json(newRating);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// pobranie średniej oceny
router.get("/average/:recipe_id", async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const recipe = await RecipeModel.findById(recipe_id);
    if (!recipe) {
      return res.status(404).json({ error: "Przepis nie został znaleziony" });
    }

    const ratings = await RatingModel.aggregate([
      { $match: { recipe_id: mongoose.Types.ObjectId(recipe_id) } },
      { $group: { _id: "$recipe_id", averageRating: { $avg: "$rating" } } },
    ]);

    const averageRating = ratings.length > 0 ? ratings[0].averageRating : 0;

    res.json({ recipe_id, averageRating });
  } catch {
    res.status(500).json({ error: err.message });
  }
});

// aktualizacja oceny
router.put(":/id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ error: "Ocena musi być w przedziale od 1 do 5" });
    }

    const existingRating = await RatingModel.findOne({
      _id: id,
      user_id: req.user.id,
    });
    if (!existingRating) {
      return res
        .status(404)
        .json({ error: "Ocena nie została znaleziona lub brak uprawnień" });
    }

    existingRating.rating = rating;
    await existingRating.save();

    res.json(existingRating);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// usunięcie oceny
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const existingRating = await RatingModel.findOne({
      _id: id,
      user_id: req.user.id,
    });
    if (!existingRating) {
      return res
        .status(404)
        .json({ error: "Ocena nie została znaleziona lub brak uprawnień" });
    }

    await existingRating.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
