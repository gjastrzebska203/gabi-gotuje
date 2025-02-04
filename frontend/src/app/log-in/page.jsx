"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/users/login`,
        data
      );
      sessionStorage.setItem("token", response.data.token);
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.error || "Nieprawidłowe dane logowania!");
    }
  };

  return (
    <div className="log-page">
      <img
        className="page"
        src="https://static01.nyt.com/images/2024/08/30/multimedia/VV-Chewy-Brownie-Cookiesrex-gcmh/VV-Chewy-Brownie-Cookiesrex-gcmh-mediumSquareAt3X.jpg"
        alt="cookies"
      />
      <div className="log-sign">
        <div className="log-sign-inner">
          <h2>Logowanie</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="inputs">
              <input
                type="text"
                placeholder="Email"
                {...register("email", { required: true })}
              />
              <input
                type="password"
                placeholder="Hasło"
                {...register("password", { required: true })}
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button id="log-in" type="submit">
              Zaloguj się
            </button>
          </form>
          <div id="no-account">
            <p>Nie masz jeszcze konta?</p>
            <button onClick={() => router.push("/register")}>
              Zarejestruj się
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
