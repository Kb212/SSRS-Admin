import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa6";
import MessageModal from "../ui/MessageModal";

function AddIngredientsTagsCategories() {
  // State for form inputs
  const [tagName, setTagName] = useState("");
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientCalorie, setIngredientCalorie] = useState("");
  const [categoryName, setCategoryName] = useState("");

  // State for fetched data
  const [tags, setTags] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);

  // State for loading indicators
  const [isLoading, setIsLoading] = useState({
    tags: false,
    ingredients: false,
    categories: false,
  });

  const [modalStatus, setModalStatus] = useState(null);
  const [modalMessage, setModalMessage] = useState("");

  // Fetch all data on component mount
  useEffect(() => {
    fetchTags();
    fetchIngredients();
    fetchCategories();
  }, []);

  // Fetch tags from API
  const fetchTags = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/tags");
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  // Fetch ingredients from API
  const fetchIngredients = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/ingredients");
      const data = await response.json();
      setIngredients(data.ingredients);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Add a new tag
  const addTag = async (e) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    setIsLoading((prev) => ({ ...prev, tags: true }));
    try {
      const response = await fetch("http://127.0.0.1:8000/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name: tagName }),
      });

      const data = await response.json();
      console.log("Response from backend:", data);

      if (!response.ok) {
        setModalStatus(false);
        setModalMessage("Failed to add tag(s): ", data);
        return;
      }

      if (response.ok) {
        setTagName("");
        fetchTags();
      } else {
        console.error("Failed to add tag");
      }
    } catch (error) {
      console.error("Error adding tag:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, tags: false }));
    }
  };

  // Add a new ingredient
  const addIngredient = async (e) => {
    e.preventDefault();
    if (!ingredientName.trim() || !ingredientCalorie) return;

    const ingredientData = [
      {
        name: ingredientName,
        calorie: parseFloat(ingredientCalorie), // Ensure calorie is a number
      },
    ];

    try {
      const response = await fetch("http://127.0.0.1:8000/api/ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Bearer"
        },
        body: JSON.stringify({ ingredients: ingredientData }),
      });

      const data = await response.json();
      console.log("Response from backend:", data);

      if (!response.ok) {
        setModalStatus(false);
        setModalMessage(data.message);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setIngredientName("");
      setIngredientCalorie("");
      fetchIngredients();
    } catch (error) {
      console.error("Error adding ingredient:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, ingredients: false }));
    }
  };

  // Add a new category
  const addCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setIsLoading((prev) => ({ ...prev, categories: true }));
    try {
      const response = await fetch("http://127.0.0.1:8000/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: categoryName }),
      });

      if (!response.ok) {
        setModalStatus(false);
        setModalMessage("Failed to add category. Please try again.");
        return;
      }

      if (response.ok) {
        setCategoryName("");
        fetchCategories();
      } else {
        console.error("Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, categories: false }));
    }
  };

  // Delete a tag
  const deleteTag = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/tags/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setModalStatus(false);
        setModalMessage("Failed to delete tag. Please try again.");
        return;
      }

      if (response.ok) {
        fetchTags();
      } else {
        console.error("Failed to delete tag");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  // Delete an ingredient
  const deleteIngredient = async (id) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/ingredients/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        setModalStatus(false);
        setModalMessage("Failed to delete ingredient. Please try again.");
        return;
      }

      if (response.ok) {
        fetchIngredients();
      } else {
        console.error("Failed to delete ingredient");
      }
    } catch (error) {
      console.error("Error deleting ingredient:", error);
    }
  };

  // Delete a category
  const deleteCategory = async (id) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        setModalStatus(false);
        setModalMessage("Failed to delete category. Please try again.");
        return;
      }

      if (response.ok) {
        fetchCategories();
      } else {
        console.error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <section className="p-6">
      <div className="w-full">
        <div className="flex justify-between items-center pr-8 mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              Ingredients, Tags, and Categories
            </h1>
            <p className="text-gray-500">
              You can add and delete ingredients, tags and categories in this
              page
            </p>
          </div>
        </div>

        <div className="xl:grid xl:grid-cols-2 xl:gap-10">
          {/* Tags Section */}
          <div className="mb-8">
            <div className="flex mb-4">
              <input
                type="text"
                placeholder="Add Tags (Multiple input: Onion, Garlic, Ginger)"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="flex-grow p-3 border rounded-md bg-white mr-2"
              />
              <button
                onClick={addTag}
                disabled={isLoading.tags}
                className="bg-white p-3 rounded-md flex items-center justify-center w-12 h-12"
              >
                <span className="text-2xl">+</span>
              </button>
            </div>

            <div className="bg-white p-4 rounded-md">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="bg-gray-800 text-white px-3 py-1 rounded-md flex items-center font-semibold"
                  >
                    {tag.name}
                    <button
                      onClick={() => deleteTag(tag.id)}
                      className="ml-2 text-white"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="mb-8">
            <div className="flex mb-4">
              <input
                type="text"
                placeholder="Add Ingredient Name"
                value={ingredientName}
                onChange={(e) => setIngredientName(e.target.value)}
                className="flex-grow p-3 border rounded-md bg-white mr-2"
              />
              <input
                type="number"
                placeholder="Calories/100 g"
                value={ingredientCalorie}
                onChange={(e) => setIngredientCalorie(e.target.value)}
                className="w-48 p-3 border rounded-md bg-white mr-2"
              />
              <button
                onClick={addIngredient}
                disabled={isLoading.ingredients}
                className="bg-white p-3 rounded-md flex items-center justify-center w-12 h-12"
              >
                <span className="text-2xl">+</span>
              </button>
            </div>

            <div className="bg-white p-4 rounded-md">
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="bg-gray-800 text-white px-3 py-1 rounded-md flex items-center font-semibold"
                  >
                    {ingredient.name}
                    <button
                      onClick={() => deleteIngredient(ingredient.id)}
                      className="ml-2 text-white"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-8">
            <div className="flex mb-4">
              <input
                type="text"
                placeholder="Add Categories (Only 'Food' and 'Drink' are recommended)"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="flex-grow p-3 border rounded-md bg-white mr-2"
              />
              <button
                onClick={addCategory}
                disabled={isLoading.categories}
                className="bg-white p-3 rounded-md flex items-center justify-center w-12 h-12"
              >
                <span className="text-2xl">+</span>
              </button>
            </div>

            <div className="bg-white p-4 rounded-md">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-gray-800 text-white px-3 py-1 rounded-md flex items-center font-semibold"
                  >
                    {category.name}
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="ml-2 text-white"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalStatus !== null && (
        <MessageModal
          isItError={!modalStatus}
          message={modalMessage}
          closeMessageBackdrop={() => {
            setModalStatus(null);
            setModalMessage("");
          }}
        />
      )}
    </section>
  );
}

export default AddIngredientsTagsCategories;
