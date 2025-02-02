"use client";
const express = require("express");
const RecipeModel = require("../models/RecipeModel");
const authenticate = require("../middlewares/auth");
const router = express.Router();

// dodawanie przepisu
router.post("/", authenticate, async (req, res) => {
  try {
    const { title, description, ingredients, steps, image } = req.body;

    if (!title || !description || !ingredients.length || !steps.length) {
      return res.status(400).json({
        error: "Wszystkie pola są wymagane!",
      });
    }

    const newRecipe = new RecipeModel({
      title,
      description,
      ingredients,
      steps,
      image,
      created_by: req.user.id,
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// pobieranie wszystkich przepisów
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }
    const recipes = await RecipeModel.find(query);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// pobieranie przepisu po id
router.get("/:id", async (req, res) => {
  try {
    const recipe = await RecipeModel.findById(req.params.id);
    if (!recipe)
      return res.status(404).json({ error: "Przepis nie został znaleziony" });

    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// pobieranie przepisu konkretnego użytkownika
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const recipes = await RecipeModel.find({ created_by: userId });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: "Błąd pobierania przepisów użytkownika." });
  }
});

// edycja przepisu
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ingredients, description, steps, image } = req.body;

    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      return res.status(404).json({ error: "Przepis nie został znaleziony" });
    }

    if (recipe.created_by.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Brak uprawnień do edytowania tego przepisu" });
    }

    if (title) recipe.title = title;
    if (description) recipe.description = description;
    if (ingredients) recipe.ingredients = ingredients;
    if (steps) recipe.steps = steps;
    if (image) recipe.image = image;

    await recipe.save();
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// usunięcie przepisu
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      return res.status(404).json({ error: "Przepis nie został znaleziony" });
    }

    if (recipe.created_by !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Brak uprawnień do usunięcia wybranego przepisu" });
    }

    await recipe.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
