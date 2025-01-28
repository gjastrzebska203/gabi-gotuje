const express = require("express");
const CommentModel = require("../models/CommentModel");
const router = express.Router();

// dodawanie nowego komentarza
router.post("/", async (req, res) => {
  try {
    const { recipe_id, user_id, content } = req.body;

    if (!recipe_id || !user_id || !content) {
      return res.status(400).json({
        error: "Wszystkie pola (recipe_id, user_id, content) są wymagane",
      });
    }

    const comment = new CommentModel({ recipe_id, user_id, content });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// pobieranie wszystkich komentarzy dla konkretnego przepisu
router.get("/", async (req, res) => {
  try {
    const { recipe_id } = req.query;

    if (!recipe_id) {
      return res.status(400).json({ error: "recipe_id jest wymagane" });
    }

    const comments = await CommentModel.find({ recipe_id }).populate(
      "user_id",
      "username email"
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// aktualizowanie komentarza
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res
        .status(400)
        .json({ error: "Treść komentarza (content) jest wymagana" });
    }

    const updatedComment = await CommentModel.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );
    if (!updatedComment) {
      return res
        .status(404)
        .json({ error: "Komentarz o podanym ID nie istnieje" });
    }

    res.json(updatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// usuwanie komentarza
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedComment = await CommentModel.findByIdAndDelete(id);
    if (!deletedComment) {
      return res
        .status(404)
        .json({ error: "Komentarz o podanym ID nie istnieje" });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
