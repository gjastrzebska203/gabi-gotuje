"use client";
import Navigation from "@/app/components/Navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
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
  const [notifications, setNotifications] = useState([]);

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
      const token = sessionStorage.getItem("token");
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
      const viewedRecipes = Cookies.get("viewedRecipes");
      let viewedArray = viewedRecipes ? JSON.parse(viewedRecipes) : [];
      if (!viewedArray.includes(id)) {
        viewedArray.unshift(id);
        if (viewedArray.length > 5) viewedArray.pop();
        Cookies.set("viewedRecipes", JSON.stringify(viewedArray), {
          expires: 7,
        });
      }
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

    newSocket.on("notification", (notif) => {
      setNotifications((prev) => [...prev, notif]);
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
    const token = sessionStorage.getItem("token");
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

    const token = sessionStorage.getItem("token");
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
      // window.location.reload();

      if (socket) {
        socket.emit("newComment", {
          recipe_id: id,
          username,
          text: commentText,
        });
      }
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
    const token = sessionStorage.getItem("token");
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
    const token = sessionStorage.getItem("token");
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
    const token = sessionStorage.getItem("token");
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

      if (socket) {
        socket.emit("newRating", {
          recipe_id: id,
          username,
          rating,
        });
      }
    } catch (err) {
      alert("Błąd podczas dodawania oceny.");
    }
  };

  const handleDeleteRating = async () => {
    const token = sessionStorage.getItem("token");
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

  if (loading) return <p className="loading">Ładowanie...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!recipe) return <p className="error">Nie znaleziono przepisu.</p>;

  return (
    <div id="recipe-page" className="page">
      <Navigation></Navigation>
      <div className="content">
        <div id="notifications">
          <h3>Powiadomienia dla przepisu</h3>
          <div>
            {notifications.length === 0 ? (
              <p>Brak nowych powiadomień.</p>
            ) : (
              notifications.map((notif, index) => (
                <p key={index}>{notif.message}</p>
              ))
            )}
          </div>
        </div>

        <h2>{recipe.title}</h2>
        <img
          className="page"
          src={recipe.image || "/no-image.jpg"}
          alt={recipe.title}
        />
        <p id="description">
          <strong>Opis: </strong>
          {recipe.description || "Brak opisu"}
        </p>
        <div id="ingr">
          <h3>Składniki:</h3>
          <ul>
            {recipe.ingredients.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        <div id="steps">
          <h3>Przygotowanie:</h3>
          <ol>
            {recipe.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
        <div id="ratings">
          <strong>Średnia ocena:</strong> {averageRating || "Brak ocen"}
        </div>
        {userId && recipe.created_by && userId === recipe.created_by && (
          <div id="edit-del">
            <button onClick={() => router.push(`/recipes/${recipe._id}/edit`)}>
              Edytuj
            </button>
            <button onClick={handleDelete}>Usuń</button>
          </div>
        )}
        <div id="comments">
          <h3>Komentarze</h3>
          {comments.length === 0 ? (
            <p id="comment-item">Brak komentarzy. Bądź pierwszy!</p>
          ) : (
            comments.map((comment) => (
              <div id="comment-item" key={comment._id}>
                <div>
                  <strong>{comment.user_id.username || username}</strong>:{" "}
                  {editingCommentId === comment._id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                  ) : (
                    comment.text
                  )}
                </div>
                <div>
                  {userId === comment.user_id._id && (
                    <>
                      {editingCommentId === comment._id ? (
                        <button
                          onClick={() => handleUpdateComment(comment._id)}
                        >
                          Zapisz
                        </button>
                      ) : (
                        <>
                          <button onClick={() => handleEditComment(comment)}>
                            Edytuj
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            Usuń
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {userId && (
          <div id="new-rating">
            <p>
              <strong>Twoja ocena:</strong> {userRating || "Nie oceniono"}
            </p>
            <div>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  style={{
                    color: star <= userRating ? "gold" : "gray",
                    border: "none",
                    boxShadow: "none",
                    padding: "4px",
                    fontSize: "24px",
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            {userRating && (
              <button onClick={handleDeleteRating}>Usuń ocenę</button>
            )}
          </div>
        )}

        {userId && (
          <div id="new-comment">
            <input
              placeholder="Dodaj komentarz..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button onClick={handleAddComment}>Dodaj komentarz</button>
          </div>
        )}

        <div id="chat">
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
        </div>
        <h3 id="users-online">Użytkownicy online: {userCount}</h3>
        <button id="go-back" onClick={() => router.push("/recipes")}>
          Powrót do listy
        </button>
      </div>
    </div>
  );
}
