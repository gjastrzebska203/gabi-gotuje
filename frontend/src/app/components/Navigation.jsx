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
      {isLoggedIn ? (
        <>
          <button onClick={() => router.push("/my-profile")}>My profile</button>
          <button onClick={handleLogout}></button>
        </>
      ) : (
        <>
          <button onClick={() => router.push("/register")}>Wyloguj</button>
          <button onClick={() => router.push("/log-in")}></button>
        </>
      )}
    </nav>
  );
}
