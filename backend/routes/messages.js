const express = require("express");
const MessageModel = require("../models/MessageModel");
const authenticateUser = require("../middlewares/auth");
const router = express.Router();

// wysyłanie wiadomości
router.post("/", authenticateUser, async (req, res) => {
  const { recipientId, message, senderId } = req.body;

  if (!recipientId || !message.trim()) {
    return res.status(400).json({ error: "Odbiorca i wiadomość są wymagane!" });
  }

  try {
    const newMessage = await MessageModel.create({
      senderId,
      recipientId,
      message,
    });
    await newMessage.save();
    console.log("wysłano wiadomość");
    res.status(201).json(newMessage);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Błąd podczas wysyłania wiadomości." });
  }
});

// pobieranie wiadomości
router.get("/:recipientId/:senderId", authenticateUser, async (req, res) => {
  const { recipientId, senderId } = req.params;

  if (!recipientId || !senderId) {
    return res.status(400).json({ error: "Brak ID użytkowników." });
  }
  try {
    const messages = await MessageModel.find({
      $or: [
        { senderId: recipientId, recipientId: senderId },
        { senderId: senderId, recipientId: recipientId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Błąd pobierania wiadomości:", err.message);
    res.status(500).json({ error: "Błąd podczas pobierania wiadomości." });
  }
});

router.put("/:messageId", authenticateUser, async (req, res) => {
  const { message } = req.body;
  const { messageId } = req.params;

  if (!message.trim()) {
    return res
      .status(400)
      .json({ error: "Treść wiadomości nie może być pusta." });
  }

  try {
    const existingMessage = await MessageModel.findById(messageId);

    if (!existingMessage) {
      return res.status(404).json({ error: "Wiadomość nie istnieje." });
    }

    if (existingMessage.senderId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Nie możesz edytować tej wiadomości." });
    }

    existingMessage.message = message;
    await existingMessage.save();

    res.json({
      message: "Wiadomość została zaktualizowana.",
      updatedMessage: existingMessage,
    });
  } catch (err) {
    console.error("Błąd edytowania wiadomości:", err.message);
    res.status(500).json({ error: "Błąd podczas edycji wiadomości." });
  }
});

module.exports = router;
