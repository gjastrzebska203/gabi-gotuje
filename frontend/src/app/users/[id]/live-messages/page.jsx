"use client";
import Navigation from "@/app/components/Navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";

export default function PrivateChatPage() {
  const { id: recipientId } = useParams();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUserId(data._id);
      } catch (err) {
        console.error("Błąd pobierania użytkownika:", err);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId || !recipientId) return;

    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.emit("joinPrivateChat", { userId, recipientId });

    newSocket.on("privateMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => newSocket.disconnect();
  }, [userId, recipientId]);

  const sendMessage = () => {
    if (!message.trim() || !socket) return;

    socket.emit("sendPrivateMessage", {
      senderId: userId,
      recipientId,
      message,
    });

    setMessages((prev) => [
      ...prev,
      { senderId: userId, message, timestamp: new Date().toISOString() },
    ]);
    setMessage("");
  };

  return (
    <div className="page">
      <Navigation />
      <div className="content" id="chat-page">
        <h2>Czatuj z użytkownikiem {recipientId}</h2>

        <div className="chat-box">
          {messages.map((msg, index) => (
            <p
              key={index}
              className={
                msg.senderId === userId ? "my-message" : "other-message"
              }
            >
              <strong>{msg.senderId === userId ? "Ty" : "Użytkownik"}:</strong>{" "}
              {msg.message}
            </p>
          ))}
        </div>
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
