"use client";
import Navigation from "../components/Navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/log-in");
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(response.data);
      } catch (err) {
        setError("Nie udało się pobrać danych użytkownika.");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/log-in");
  };

  if (error) return <p>{error}</p>;
  if (!user) return <p className="loading">Ładowanie...</p>;

  return (
    <div className="page" id="user-page">
      <Navigation></Navigation>
      <div className="content">
        <div id="user-info">
          <h2>Twój profil</h2>
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
        <div className="buttons">
          <button onClick={() => router.push("/profile/edit")}>
            Edytuj profil
          </button>
          <button onClick={handleLogout}>Wyloguj</button>
        </div>
      </div>
    </div>
  );
}
