"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Navigation from "../components/Navigation";

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
      localStorage.setItem("token", response.data.token);
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.error || "Nieprawidłowe dane logowania");
    }
  };

  return (
    <div className="page">
      <Navigation></Navigation>
      <h2>Logowanie</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
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
        <button type="submit">Zaloguj się</button>
      </form>
    </div>
  );
}
