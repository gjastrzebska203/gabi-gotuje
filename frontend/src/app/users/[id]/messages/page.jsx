"use client";
import Navigation from "@/app/components/Navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

export default function PrivateMessagesPage() {
  const { id } = useParams();
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const fetchUserAndMessages = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUserId(data._id);

        if (!data._id) {
          setError("Błąd pobierania ID użytkownika.");
          return;
        }
        console.log(`Pobieranie wiadomości dla: ${data._id} <-> ${id}`);
        const messagesRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/messages/${id}/${data._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(messagesRes.data);
        console.log("Pobrano wiadomości:", messagesRes.data);
      } catch (err) {
        setError("Błąd pobierania wiadomości.");
      }
    };

    fetchUserAndMessages();
  }, [id]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Brak tokena, musisz się zalogować.");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/messages`,
        { recipientId: id, message: message, senderId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [...prev, res.data]);
      console.log("wysłano wiadomość");
      setMessage("");
    } catch (err) {
      console.log("nie wysłano wiadomości");
      console.error(
        "Błąd wysyłania wiadomości:",
        err.response?.data || err.message
      );
      setError("Błąd wysyłania wiadomości.");
    }
  };

  const editMessage = async (messageId) => {
    if (!editText.trim()) return;

    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Musisz być zalogowany, aby edytować wiadomość.");
      return;
    }

    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/${messageId}`,
        { message: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages(
        messages.map((msg) =>
          msg._id === messageId ? { ...msg, message: editText } : msg
        )
      );

      setEditingMessageId(null);
      setEditText("");
    } catch (err) {
      console.error(
        "Błąd edycji wiadomości:",
        err.response?.data || err.message
      );
      setError("Błąd edytowania wiadomości.");
    }
  };

  return (
    <div className="page">
      <Navigation />
      <div className="content" id="chat-page">
        <h2>Prywatne wiadomości</h2>

        {messages && messages.length === 0 ? (
          <p>Brak wiadomości.</p>
        ) : (
          <div id="chat-box">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={
                  msg.senderId === userId ? "my-message" : "other-message"
                }
              >
                <strong>{msg.senderId === userId ? "Ty" : "Oni"}:</strong>

                {editingMessageId === msg._id ? (
                  <>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <button onClick={() => editMessage(msg._id)}>Zapisz</button>
                    <button onClick={() => setEditingMessageId(null)}>
                      Anuluj
                    </button>
                  </>
                ) : (
                  <>
                    <span>{msg.message}</span>
                    {msg.senderId === userId && (
                      <button
                        onClick={() => {
                          setEditingMessageId(msg._id);
                          setEditText(msg.message);
                        }}
                      >
                        Edytuj
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <input
          type="text"
          placeholder="Napisz wiadomość..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Wyślij</button>
      </div>
    </div>
  );
}
