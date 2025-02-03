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

module.exports = router;
