const mongoose = require("mongoose");

const raitingSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipe_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    reqrequired: true,
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  created_at: { type: Date, default: Date.now },
});

const RatingModel = mongoose.model("Rating", raitingSchema);
module.exports = RatingModel;
