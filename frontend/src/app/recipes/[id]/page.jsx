"use client";
import Navigation from "@/app/components/Navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function RecipeDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);

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
        console.log("ID użytkownika:", res.data._id);
        setUserId(res.data._id);
        setUsername(res.data.username);
      } catch (err) {
        setError("Błąd pobierania danych użytkownika");
      }
    };

    if (id) {
      fetchRecipe();
      fetchComments();
      getUserId();
    }
  }, [id]);

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
      <button onClick={() => router.push("/recipes")}>Powrót do listy</button>
    </div>
  );
}
