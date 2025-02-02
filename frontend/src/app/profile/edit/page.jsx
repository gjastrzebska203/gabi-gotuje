"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function EditProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        setUsername(response.data.username);
        setEmail(response.data.email);
      } catch (err) {
        setError("Nie udało się pobrać danych użytkownika.");
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    if (!token) {
      return setError("Musisz być zalogowany, aby edytować konto.");
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
        { username, email, password: password || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Dane konta zostały zaktualizowane.");
    } catch (err) {
      setError("Wystąpił błąd podczas aktualizacji konta.");
    }
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return setError("Musisz być zalogowany, aby usunąć konto.");
    }

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.removeItem("token");
      router.push("/");
    } catch (err) {
      setError("Wystąpił błąd podczas usuwania konta.");
    }
  };

  return (
    <div className="page" id="add-recipe-page">
      <h2>Edytuj profil</h2>
      {error && <p>{error}</p>}
      {success && <p>{success}</p>}

      <form id="edit-profile" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nowa nazwa użytkownika"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Nowy e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Nowe hasło (opcjonalnie)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Zapisz zmiany</button>
      </form>
      <button onClick={() => router.push("/profile")}>Powrót</button>
      <button id="second" onClick={handleDeleteAccount}>
        Usuń konto
      </button>
    </div>
  );
}
