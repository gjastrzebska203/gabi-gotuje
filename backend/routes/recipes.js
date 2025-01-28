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

router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, ingredients, steps, iimage } = req.body;

    const recipe = await RecipeModel.findById(id);
    if (!recipe) {
      return res.status(404).json({ error: "Przepis nie został znaleziony" });
    }

    if (recipe.created_by !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Brak uprawnień do edytowania tego przepisu" });
    }

    if (title) recipe.title = title;
    if (ingredients) recipe.ingredients = ingredients;
    if (steps) recipe.steps = steps;
    if (image) recipe.image = image;

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
