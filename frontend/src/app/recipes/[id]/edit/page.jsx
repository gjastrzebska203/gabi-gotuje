"use client";
import Navigation from "@/app/components/Navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

export default function EditRecipePage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [image, setImage] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/recipes/${id}`
        );
        setTitle(response.data.title);
        setDescription(response.data.description);
        setIngredients(response.data.ingredients);
        setSteps(response.data.steps);
        setImage(response.data.image);
      } catch (err) {
        setError("Nie udało się pobrać danych przepisu.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

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

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const editIngredient = (index, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = value;
    setIngredients(updatedIngredients);
  };

  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const editStep = (index, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = value;
    setSteps(updatedSteps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      return setError("Musisz być zalogowany, aby edytować przepis.");
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/recipes/${id}`,
        { title, description, ingredients, steps, image },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push(`/recipes/${id}`);
    } catch (err) {
      setError(
        err.response?.data?.error || "Wystąpił błąd podczas edycji przepisu."
      );
    }
  };

  if (loading) return <p className="loading">Ładowanie...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="page" id="add-recipe-page">
      <h2>Edytuj przepis</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tytuł"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Opis"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>

        {/* edycja składników */}
        <div>
          <h3>Składniki</h3>
          <ul>
            {ingredients.map((ingredient, index) => (
              <li key={index}>
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => editIngredient(index, e.target.value)}
                />
                <button type="button" onClick={() => removeIngredient(index)}>
                  Usuń
                </button>
              </li>
            ))}
          </ul>
          <input
            type="text"
            placeholder="Dodaj składnik"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
          />
          <button type="button" onClick={addIngredient}>
            Dodaj składnik
          </button>
        </div>

        {/* edycja kroków */}
        <div>
          <h3>Kroki przygotowania</h3>
          <ul>
            {steps.map((step, index) => (
              <li key={index}>
                <input
                  type="text"
                  value={step}
                  onChange={(e) => editStep(index, e.target.value)}
                />
                <button type="button" onClick={() => removeStep(index)}>
                  Usuń
                </button>
              </li>
            ))}
          </ul>
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

        <input
          id="margin"
          type="text"
          placeholder="Link do zdjęcia"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
        <button type="submit">Zapisz zmiany</button>
      </form>
    </div>
  );
}
