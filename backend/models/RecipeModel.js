const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true }, // tytuł
  ingredients: { type: [String], required: true }, // składniki
  steps: { type: [String], required: true }, // kroki
  image: { type: String, required: false }, // obrazek: opcjonalnie
  created_by: { type: String, required: true }, // twórca
  created_at: { type: Date, default: Date.now }, // data utworzenia
});

const RecipeModel = mongoose.model("Recipe", recipeSchema);
module.exports = RecipeModel;
