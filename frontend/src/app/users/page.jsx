"use client";
import Navigation from "../components/Navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users`
        );
        setUsers(response.data);
      } catch (err) {
        setError("Nie udało się pobrać listy użytkowników.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p className="loading">Ładowanie użytkowników...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="page">
      <Navigation></Navigation>
      <div className="content">
        <h2>Lista użytkowników</h2>
        <div className="grid" id="user-grid">
          {users.map((user) => (
            <div className="grid-item" key={user._id}>
              {user.username}
              <button onClick={() => router.push(`/users/${user._id}`)}>
                Zobacz więcej
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
