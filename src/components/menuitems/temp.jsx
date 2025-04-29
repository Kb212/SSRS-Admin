import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AddMenuItem() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes, ingredientsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/categories"),
          fetch("http://127.0.0.1:8000/api/tags"),
          fetch("http://127.0.0.1:8000/api/ingredients"),
        ]);

        const categories = await categoriesRes.json();
        const tags = await tagsRes.json();
        const ingredients = await ingredientsRes.json();

        setCategories(categories);
        setTags(tags);
        setIngredients(ingredients.ingredients); // Set ingredients data
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  // Handle category selection (update selected category)
  const handleCategoryToggle = (categoryId) => {
    setCategoryId(categoryId);
  };

  // Handle ingredient selection (toggle selection and show input for quantity)
  const handleIngredientToggle = (ingredientId) => {
    setSelectedIngredients((prev) => {
      const ingredientIndex = prev.findIndex(
        (item) => item.id === ingredientId
      );

      if (ingredientIndex === -1) {
        // Ingredient not selected, add it
        return [...prev, { id: ingredientId, quantity: "" }];
      } else {
        // Ingredient is already selected, remove it
        const updatedIngredients = [...prev];
        updatedIngredients.splice(ingredientIndex, 1);
        return updatedIngredients;
      }
    });
  };

  // Handle ingredient quantity change
  const handleIngredientQuantityChange = (ingredientId, quantity) => {
    setSelectedIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.id === ingredientId
          ? { ...ingredient, quantity: quantity }
          : ingredient
      )
    );
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags((prevTags) => {
      if (prevTags.includes(tagId)) {
        // If the tag is already selected, remove it
        return prevTags.filter((id) => id !== tagId);
      } else {
        // Otherwise, add it to the selected tags
        return [...prevTags, tagId];
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      name,
      price,
      category_id: categoryId,
      description,
      tags: selectedTags,
      ingredients: selectedIngredients.map((ingredient) => ({
        ingredient_id: ingredient.id,
        quantity: ingredient.quantity,
      })),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/menuitems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData), // Send the data as JSON
      });

      const data = await response.json();
      console.log("Response from backend:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to add menu item");
      }

      navigate("/menuitems"); // Redirect to main page after success
    } catch (error) {
      console.error("Error adding menu item", error);
      alert(error.message); // Show the error message for debugging
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      name &&
      price &&
      categoryId &&
      description &&
      Object.keys(selectedIngredients).length > 0
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Add Foods and Drinks
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price
              </label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category (Display as clickable buttons) */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`px-4 py-2 border rounded-md ${
                      categoryId === category.id
                        ? "bg-blue-500 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Upload Image */}
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Upload Image
              </label>
              <input
                type="file"
                id="image"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700"
              >
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-5 py-2 border rounded-lg font-medium text-gray-700 transition-all hover:bg-blue-500 hover:text-white ${
                      selectedTags.includes(tag.id)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredients (Clickable with input for grams) */}
            <div>
              <label
                htmlFor="ingredients"
                className="block text-sm font-medium text-gray-700"
              >
                Ingredients
              </label>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient) => (
                  <div key={ingredient.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleIngredientToggle(ingredient.id)}
                      className={`px-5 py-2 border rounded-lg font-medium text-gray-700 transition-all hover:bg-blue-500 hover:text-white ${
                        selectedIngredients.some(
                          (item) => item.id === ingredient.id
                        )
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      {ingredient.name}
                    </button>

                    {/* Show quantity input when ingredient is selected */}
                    {selectedIngredients.some(
                      (item) => item.id === ingredient.id
                    ) && (
                      <input
                        type="number"
                        value={
                          selectedIngredients.find(
                            (item) => item.id === ingredient.id
                          )?.quantity || ""
                        }
                        onChange={(e) =>
                          handleIngredientQuantityChange(
                            ingredient.id,
                            e.target.value
                          )
                        }
                        placeholder="grams"
                        className="w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-right">
              <button
                type="submit"
                className={`py-2 px-6 bg-green-600 text-white font-semibold rounded-md ${
                  isFormValid() && "cursor-pointer"
                }`}
                disabled={loading || !isFormValid()} // Disable if form is not valid or loading
                title={
                  !isFormValid()
                    ? "Please fill all the fields before adding"
                    : ""
                }
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

