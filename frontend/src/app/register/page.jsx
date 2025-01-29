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
        `${process.env.NEXT_PUBLIC_API_URL / users / register}`,
        data
      );
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Wystąpił błąd rejestracji");
    }
  };

  return (
    <div className="page">
      <h2>Rejestracja</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
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
        <button type="submit">Zarejestruj się</button>
      </form>
    </div>
  );
}
