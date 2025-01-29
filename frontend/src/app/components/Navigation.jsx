"use client";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();
  const isLoggedIn = localStorage.getItem("token") ? true : false;

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/log-in");
  };

  return (
    <nav>
      <button onClick={() => router.push("/")}>Strona główna</button>
      <button onClick={() => router.push("/recipes")}>Przepisy</button>
      {isLoggedIn ? (
        <>
          <button onClick={() => router.push("/add-recipe")}>
            Dodaj przepis
          </button>
          <button onClick={() => router.push("/profile")}>Profil</button>
          <button onClick={handleLogout}>Wyloguj</button>
        </>
      ) : (
        <>
          <button onClick={() => router.push("/register")}>
            Zarejestruj się
          </button>
          <button onClick={() => router.push("/log-in")}>Zaloguj się</button>
        </>
      )}
    </nav>
  );
}
