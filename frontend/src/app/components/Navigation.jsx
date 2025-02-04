"use client";
import { useRouter } from "next/navigation";

export default function Navigation() {
  const router = useRouter();
  const isLoggedIn = sessionStorage.getItem("token") ? true : false;

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    router.push("/log-in");
  };

  return (
    <nav>
      <div className="image">
        <img id="font" src="/font.png" alt="Logo aplikacji" height="100" />
      </div>
      <div className="buttons">
        <button onClick={() => router.push("/")}>Strona główna</button>
        <button onClick={() => router.push("/recipes")}>Przepisy</button>
        <button onClick={() => router.push("/users")}>Użytkownicy</button>
        {isLoggedIn ? (
          <>
            <button onClick={() => router.push("/add-recipe")}>
              Dodaj przepis
            </button>
            <button onClick={() => router.push("/profile")}>Mój profil</button>
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
      </div>
    </nav>
  );
}
