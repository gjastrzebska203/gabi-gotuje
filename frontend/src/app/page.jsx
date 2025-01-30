"use client";
import Navigation from "./components/Navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";

export default function HomePage() {
  const router = useRouter();
  const [recentRecipes, setRecentRecipes] = useState([]);

  useEffect(() => {
    const viewedRecipes = Cookies.get("viewedRecipes");
    if (!viewedRecipes) return;

    const recipeIds = JSON.parse(viewedRecipes);

    const fetchRecipes = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/recipes`,
          {
            params: { ids: recipeIds.join(",") },
          }
        );
        setRecentRecipes(response.data);
      } catch (err) {
        console.error("Błąd pobierania ostatnio oglądanych przepisów.");
      }
    };

    fetchRecipes();
  }, []);
  return (
    <div className="page">
      <Navigation></Navigation>
      <h3>Gabi gotuje</h3>
      <h2>Ostatnio oglądane przepisy</h2>
      {recentRecipes.length === 0 ? (
        <p>Nie oglądałeś jeszcze żadnych przepisów.</p>
      ) : (
        <ul>
          {recentRecipes.map((recipe) => (
            <button
              key={recipe._id}
              onClick={() => router.push(`/recipes/${recipe._id}`)}
            >
              {recipe.title}
            </button>
          ))}
        </ul>
      )}
    </div>
  );
}
