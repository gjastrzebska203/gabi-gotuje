import { useState, useEffect } from "react";
import axios from "axios";

export default function Rating({ recipeId, userId }) {
  const [rating, setRating] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserRating = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/ratings/${recipeId}/${userId}`
        );
        if (response.data) {
          setUserRating(response.data);
          setRating(response.data.rating);
        }
      } catch (error) {
        setError("Błąd pobierania oceny");
      }
    };

    fetchUserRating();
  }, [recipeId, userId]);

  const handleRating = async (newRating) => {
    if (!userId) return;

    try {
      if (userRating) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/ratings/${userRating._id}`,
          { rating: newRating },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/ratings`,
          { recipe_id: recipeId, rating: newRating },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserRating(response.data);
      }

      setRating(newRating);
    } catch (err) {
      setError("Błąd podczas oceniania.");
    }
  };

  const handleDeleteRating = async () => {
    if (!userRating) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/ratings/${userRating._id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setUserRating(null);
      setRating(null);
    } catch (err) {
      setError("Błąd podczas usuwania oceny.");
    }
  };

  return (
    <div className="rating">
      <h3>Ocena</h3>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => handleRating(star)}
          style={{ cursor: "pointer", color: star <= rating ? "gold" : "gray" }}
        >
          ★
        </span>
      ))}
      {userRating && (
        <button
          onClick={handleDeleteRating}
          style={{ marginLeft: "10px", color: "red" }}
        >
          Usuń ocenę
        </button>
      )}
      {error && <p>{error}</p>}
    </div>
  );
}
