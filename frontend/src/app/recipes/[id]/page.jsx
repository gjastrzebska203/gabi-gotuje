"use client";
import Navigation from "@/app/components/Navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";

export default function RecipeDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [averageRating, setAverageRating] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("Anonim");
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/recipes/${id}`
        );
        setRecipe(response.data);
      } catch (err) {
        setError("Nie udało się pobrać szczegółów przepisu.");
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/comments/${id}`
        );
        setComments(response.data);
      } catch (err) {
        setError("Błąd pobierania komentarzy");
      }
    };

    const fetchRatings = async () => {
      try {
        const avgRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/ratings/average/${id}`
        );
        setAverageRating(avgRes.data.average);
      } catch (err) {
        console.error("Błąd pobierania średniej oceny:", err);
      }
    };

    const getUserId = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsername(res.data.username);
        setUserId(res.data._id);
      } catch (err) {
        setError("Błąd pobierania danych użytkownika");
      }
    };

    if (id) {
      fetchRecipe();
      fetchRatings();
      fetchComments();
      getUserId();
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.emit("join", { username, recipeId: id });

    newSocket.on("message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    newSocket.on("userCount", ({ count }) => {
      console.log("Aktualna liczba użytkowników:", count);
      setUserCount(count);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id, username]);

  const sendMessage = () => {
    if (message.trim() && socket) {
      socket.emit("sendMessage", message);
      setMessage("");
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/recipes");
    } catch (err) {
      setError("Wystąpił błąd podczas usuwania przepisu.");
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      return alert("Musisz być zalogowany, aby dodać komentarz.");
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/comments`,
        { recipe_id: id, text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments([...comments, response.data]);
      setCommentText("");
      window.location.reload();
    } catch (err) {
      console.log({ error: err.message });
      setError("Wystąpił błąd podczas dodawania komentarza.");
    }
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
  };

  const handleUpdateComment = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return alert("Musisz być zalogowany, aby edytować komentarz.");
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}`,
        { text: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments(
        comments.map((c) => (c._id === commentId ? response.data : c))
      );
      setEditingCommentId(null);
      setEditText("");
      window.location.reload();
    } catch (err) {
      setError("Błąd podczas edycji komentarza");
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return alert("Musisz być zalogowany, aby usunąć komentarz.");
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(comments.filter((comment) => comment._id !== commentId));
    } catch (err) {
      setError("Wystąpił błąd podczas usuwania komentarza.");
    }
  };

  const handleRating = async (rating) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Musisz być zalogowany, aby ocenić przepis.");
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ratings`,
        { recipe_id: id, rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setUserRating(rating);
      setAverageRating((prev) => ((prev * 4 + rating) / 5).toFixed(1));
    } catch (err) {
      alert("Błąd podczas dodawania oceny.");
    }
  };

  const handleDeleteRating = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Musisz być zalogowany, aby usunąć ocenę.");
    }

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/ratings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserRating(null);
      fetchRatings();
    } catch (err) {
      console.log("Błąd podczas usuwania oceny.");
    }
  };

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p>{error}</p>;
  if (!recipe) return <p>Nie znaleziono przepisu.</p>;

  return (
    <div className="page">
      <Navigation></Navigation>
      <h2>{recipe.title}</h2>
      <img
        src={recipe.image || "/no-image.jpg"}
        alt={recipe.title}
        style={{ height: "140px" }}
      />
      <p>
        <strong>Opis:</strong>
        {recipe.description || "Brak opisu"}
      </p>
      <h3>Składniki:</h3>
      <ul>
        {recipe.ingredients.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <h3>Przygotowanie:</h3>
      <ul>
        {recipe.steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ul>
      <h3>Oceny:</h3>
      <p>
        <strong>Średnia ocena:</strong> {averageRating || "Brak ocen"}
      </p>
      {userId && (
        <div>
          <p>
            <strong>Twoja ocena:</strong> {userRating || "Nie oceniono"}
          </p>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              style={{ color: star <= userRating ? "gold" : "gray" }}
            >
              ★
            </button>
          ))}
          {userRating && (
            <button
              onClick={handleDeleteRating}
              style={{ marginLeft: "10px", color: "red" }}
            >
              Usuń ocenę
            </button>
          )}
        </div>
      )}
      <h3>Komentarze</h3>
      {comments.length === 0 ? (
        <p>Brak komentarzy. Bądź pierwszy!</p>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li key={comment._id}>
              <strong>{comment.user_id.username}</strong>:{" "}
              {editingCommentId === comment._id ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
              ) : (
                comment.text
              )}
              {userId === comment.user_id._id && (
                <>
                  {editingCommentId === comment._id ? (
                    <button onClick={() => handleUpdateComment(comment._id)}>
                      Zapisz
                    </button>
                  ) : (
                    <>
                      <button onClick={() => handleEditComment(comment)}>
                        Edytuj
                      </button>
                      <button onClick={() => handleDeleteComment(comment._id)}>
                        Usuń
                      </button>
                    </>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {userId && (
        <div>
          <textarea
            placeholder="Dodaj komentarz..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button onClick={handleAddComment}>Dodaj komentarz</button>
        </div>
      )}
      {userId && recipe.created_by && userId === recipe.created_by && (
        <>
          <button onClick={() => router.push(`/recipes/${recipe._id}/edit`)}>
            Edytuj
          </button>
          <button onClick={handleDelete}>Usuń</button>
        </>
      )}

      <h3>Czat na żywo</h3>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.user}:</strong> {msg.text}
          </p>
        ))}
      </div>
      {userId ? (
        <div>
          <input
            type="text"
            placeholder="Napisz wiadomość..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
            Wyślij
          </button>
        </div>
      ) : (
        <p>Musisz być zalogowany, aby pisać na czacie.</p>
      )}
      <h3>Użytkownicy online: {userCount}</h3>
      <button onClick={() => router.push("/recipes")}>Powrót do listy</button>
    </div>
  );
}
