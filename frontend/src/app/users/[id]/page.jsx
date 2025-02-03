"use client";
import Navigation from "@/app/components/Navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function UserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`
        );
        setUser(response.data);
      } catch (err) {
        setError("Nie udało się pobrać danych użytkownika.");
      }
    };

    const fetchUserRecipes = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/recipes/user/${id}`
        );
        setRecipes(response.data);
      } catch (err) {
        setError("Nie udało się pobrać przepisów użytkownika.");
      }
    };

    fetchUser();
    fetchUserRecipes();
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!user) return <p className="loading">Ładowanie...</p>;

  return (
    <div className="page" id="user-page">
      <Navigation></Navigation>
      <div className="content">
        <div id="user-info">
          <h2>Profil użytkownika</h2>
          <p>
            <strong>Nazwa użytkownika:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Rola:</strong> {user.role || "Użytkownik"}
          </p>
        </div>
        <button onClick={() => router.push(`/users/${id}/live-messages`)}>
          Wiadomości na żywo
        </button>
        <button onClick={() => router.push(`/users/${id}/messages`)}>
          Wyślij wiadomość
        </button>
        <div id="user-recipes">
          <h3>Przepisy użytkownika:</h3>
          {recipes.length === 0 ? (
            <p>Ten użytkownik nie dodał jeszcze żadnych przepisów.</p>
          ) : (
            <div id="recipes">
              {recipes.map((recipe) => (
                <div key={recipe._id} id="recipe-item">
                  <h4>{recipe.title}</h4>
                  <img
                    className="small"
                    src={recipe.image}
                    alt="recipe-image"
                  />
                  <button key={recipe._id}>Zobacz więcej...</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
