const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  recipe_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true,
  }, // id przepisu
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // id użytkownika
  content: {
    type: String,
    required: true,
  }, // treść
  created_at: {
    type: Date,
    default: Date.now,
  }, // data dodania
});

const CommentModel = mongoose.model("Comment", commentSchema);
module.exports = CommentModel;
