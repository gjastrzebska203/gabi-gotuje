const express = require("express");
const authenticate = require("../middlewares/auth");
const CommentModel = require("../models/CommentModel");
const router = express.Router();

// dodawanie nowego komentarza
router.post("/", authenticate, async (req, res) => {
  try {
    const { recipe_id, text } = req.body;

    if (!recipe_id || !text) {
      return res.status(400).json({
        error: "Wszystkie pola są wymagane",
      });
    }

    const comment = new CommentModel({
      recipe_id,
      user_id: req.user.id,
      text,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// pobieranie wszystkich komentarzy dla konkretnego przepisu
router.get("/:recipe_id", async (req, res) => {
  try {
    const comments = await CommentModel.find({
      recipe_id: req.params.recipe_id,
    }).populate("user_id", "username");
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// aktualizowanie komentarza
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await CommentModel.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: "Komentarz nie znaleziony" });
    }

    if (comment.user_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Nie masz uprawnień do edytowania tego komentarza" });
    }

    comment.text = text || comment.text;
    await comment.save();
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// // usuwanie komentarza
// router.delete("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedComment = await CommentModel.findByIdAndDelete(id);
//     if (!deletedComment) {
//       return res
//         .status(404)
//         .json({ error: "Komentarz o podanym ID nie istnieje" });
//     }

//     res.status(204).send();
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;
