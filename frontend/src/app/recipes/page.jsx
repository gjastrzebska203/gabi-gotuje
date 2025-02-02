"use client";
import Navigation from "../components/Navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/recipes`,
          {
            params: search ? { search } : {},
          }
        );
        setRecipes(response.data);
      } catch (err) {
        setError("Nie udało się załadować przepisów.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [search]);

  return (
    <div className="page">
      <Navigation></Navigation>
      <div className="content">
        <div id="recipe-search">
          <h2>Lista przepisów</h2>
          <input
            type="text"
            placeholder="Wyszukaj przepis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid">
          {loading ? (
            <p>Ładowanie...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : recipes.length === 0 ? (
            <p>Brak wyników dla "{search}".</p>
          ) : (
            recipes.map((recipe) => (
              <div className="grid-item" key={recipe._id}>
                <h3>{recipe.title}</h3>
                <img className="recipe-image" src={recipe.image} alt="" />
                <p>{recipe.description.substring(0, 100)}...</p>
                <button onClick={() => router.push(`/recipes/${recipe._id}`)}>
                  Zobacz więcej
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
