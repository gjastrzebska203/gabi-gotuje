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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
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
      } catch (err) {
        console.error("Błąd pobierania danych użytkownika", err);
      }
    };

    if (id) {
      fetchRecipe();
      getUserId();
    }
  }, [id]);

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
      {userId && recipe.created_by && userId === recipe.created_by && (
        <button onClick={() => router.push(`/recipes/${recipe._id}/edit`)}>
          Edytuj
        </button>
      )}
      <button onClick={() => router.push("/recipes")}>Powrót do listy</button>
    </div>
  );
}
