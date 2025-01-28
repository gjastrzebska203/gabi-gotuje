const express = require("express");
const RatingModel = require("../models/RatingModel");
const RecipeModel = require("../models/RecipeModel");
const authenticate = require("../middlewares/auth");
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
