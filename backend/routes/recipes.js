const express = require("express");
const RecipeModel = require("../models/RecipeModel");
const authenticate = require("../middlewares/auth");
const router = express.Router();

// dodawanie przepisu
router.post("/", async (req, res) => {
  try {
    const { title, ingredients, steps, image } = req.body;

    if (!title || !ingredients || !steps) {
      return res
        .status(400)
        .json({ error: "Pola title, ingredients i steps są wymagane" });
    }

    const recipe = new RecipeModel({
      title,
      ingredients,
      steps,
      image,
      created_by: req.user.id,
    });

    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// pobieranie wszystkich przepisów
router.get("/", async (req, res) => {
  try {
    const recipes = await RecipeModel.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
