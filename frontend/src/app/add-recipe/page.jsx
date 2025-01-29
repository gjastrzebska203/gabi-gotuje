"use client";
import { use, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AddRecipePage() {
  const [title, setTitile] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const [ingredientInput, setIngredientInput] = useState("");
  const [stepInput, setStepInput] = useState("");

  const addIngredient = () => {
    if (ingredientInput.trim() !== "") {
      setIngredients([...ingredients, ingredientInput]);
      setIngredientInput("");
    }
  };

  const addStep = () => {
    if (stepInput.trim() !== "") {
      setSteps([...steps, stepInput]);
      setStepInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      return setError("Musisz być zalogowany, aby dodać przepis.");
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/recipes`,
        { title, description, ingredients, steps, image },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      router.push("/recipes");
    } catch (err) {
      setError(
        err.response?.data?.error || "Wystąpił błąd podczas dodawania przepisu."
      );
    }
  };

  return (
    <div className="page">
      <Navigation></Navigation>
      <h2>Dodaj nowy przepis</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tytuł przepisu"
          value={title}
          onChange={(e) => setTitile(e.target.value)}
          required
        />
        <textarea
          placeholder="Opis przepisu"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>

        {/* składniki */}
        <div>
          <input
            type="text"
            placeholder="Dodaj składnik"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
          />
          <button type="button" onClick={addIngredient}>
            Dodaj składnik
          </button>
          <ul>
            {ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>

          {/* kroki */}
          <div>
            <input
              type="text"
              placeholder="Dodaj krok"
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
            />
            <button type="button" onClick={addStep}>
              Dodaj krok
            </button>
          </div>
          <ul>
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>

          <input
            type="text"
            placeholder="Link do obrazka"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <button type="submit">Dodaj przepis</button>
        </div>
      </form>
    </div>
  );
}
