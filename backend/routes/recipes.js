const express = require("express");
const RecipeModel = require("../models/RecipeModel");
const router = express.Router();

// dodawanie przepisu
router.post("/", async (req, res) => {
  try {
    const recipe = new RecipeModel(req.body);
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
