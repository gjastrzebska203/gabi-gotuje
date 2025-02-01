"use client";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/register`,
        data
      );
      router.push("/log-in");
    } catch (err) {
      setError(err.response?.data?.error || "Wystąpił błąd rejestracji");
    }
  };

  return (
    <div className="log-page">
      <img
        className="page"
        src="https://static01.nyt.com/images/2022/02/12/dining/JT-Chocolate-Chip-Cookies/JT-Chocolate-Chip-Cookies-mediumSquareAt3X.jpg"
        alt="cookies"
      />
      <div className="log-sign">
        <div className="log-sign-inner">
          <h2>Rejestracja</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="inputs">
              <input
                type="text"
                placeholder="Nazwa użytkownika"
                {...register("username", { required: true })}
              />
              <input
                type="email"
                placeholder="Email"
                {...register("email", { required: true })}
              />
              <input
                type="password"
                placeholder="Hasło"
                {...register("password", { required: true })}
              />
            </div>
            {error && <p>{error}</p>}
            <button id="log-in" type="submit">
              Zarejestruj się
            </button>
          </form>
          <div id="no-account">
            <p>Masz już konto?</p>
            <button onClick={() => router.push("/log-in")}>Zaloguj się</button>
          </div>
        </div>
      </div>
    </div>
  );
}
