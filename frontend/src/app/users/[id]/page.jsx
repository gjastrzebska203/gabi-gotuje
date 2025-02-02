"use client";
import Navigation from "@/app/components/Navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

export default function UserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

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

    fetchUser();
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!user) return <p>Ładowanie...</p>;

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
      </div>
    </div>
  );
}
