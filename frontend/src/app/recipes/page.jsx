"use client";
import Navigation from "../components/Navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Router } from "next/router";

export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/recipes`
        );
        setRecipes(response.data);
      } catch (err) {
        setError("Nie udało się załadować przepisów.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) return <p>Ładowanie przepisów...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="page">
      <Navigation></Navigation>
      <h2>Lista przepisów</h2>
      <ul>
        {recipes.map((recipe, index) => (
          <li key={recipe._id}>
            <h3>{recipe.title}</h3>
            <p>{recipe.description}</p>
            <button onClick={() => router.push(`/recipes/${recipe._id}`)}>
              Zobacz więcej
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
