"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BiChevronDown } from "react-icons/bi";
import MessageModal from "../ui/MessageModal";

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
  const [selectedImageName, setSelectedImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setSelectedImageName(file.name);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Create a new FormData object
    const formData = new FormData();

    // Append all form fields to FormData
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category_id", categoryId);
    formData.append("description", description);

    // Append tags as an array of tag ids
    selectedTags.forEach((tagId) => {
      formData.append("tags[]", tagId); // "tags[]" allows the backend to process it as an array
    });

    // Append ingredients as individual fields
    selectedIngredients.forEach((ingredient, index) => {
      formData.append(`ingredients[${index}][ingredient_id]`, ingredient.id); // Append ingredient_id
      formData.append(`ingredients[${index}][quantity]`, ingredient.quantity); // Append quantity
    });

    // Append the image file (if any)
    if (image) {
      formData.append("image", image); // The key "image" should match your backend API
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/menuitems", {
        method: "POST",
        headers: {
          // You don't need to set Content-Type, FormData will set it automatically
          Accept: "application/json",
        },
        body: formData, // Send the FormData object as the body
      });

      const data = await response.json();
      console.log("Response from backend:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to add menu item");
      }

      setModalStatus(true);
      setModalMessage(data.message || "Menu item created successfully!");
      setTimeout(() => {
        navigate("/menuitems");
      }, 2000);
    } catch (error) {
      console.error("Error adding menu item", error);
      setModalStatus(false);
      setModalMessage(error.message || "Failed to add menu item.");
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
    <section className="p-6">
      <div className="w-full">
        <div className="flex justify-between items-center pr-8 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Add food and Drinks</h1>
            <p className="text-gray-500">
              You can add the foods and drinks you want to serve here
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Name */}
              <div className="bg-white rounded-md p-4">
                <label className="block font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#333]"
                  placeholder="Grilled Chicken"
                />
              </div>

              {/* Price */}
              <div className="bg-white rounded-md p-4">
                <label className="block font-medium mb-1">Price (ETB)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#333]"
                  placeholder="1000"
                />
              </div>

              {/* Category */}
              <div className="bg-white rounded-md p-4">
                <label className="block font-medium mb-1">Categories</label>
                <div className="flex flex-wrap gap-2 mt-4">
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`px-3 py-1 border rounded-md ${
                        categoryId === category.id
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-800"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-md p-4">
                <label className="block font-medium mb-1">Tags</label>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search Tags"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#333]"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {tags.map((tag) => (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-3 py-1 border rounded-md ${
                        selectedTags.includes(tag.id)
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-800"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Description */}
              <div className="bg-white rounded-md p-4">
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-[147px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#333]"
                  placeholder="Description of the food to explain what it looks and feels like, and what it contains"
                />
              </div>

              {/* Upload Image */}
              <div className="bg-white rounded-md p-4">
                <label className="block font-medium mb-1">Upload Image</label>
                <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                  <input
                    type="file"
                    id="image"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer text-gray-500"
                  >
                    {selectedImageName
                      ? selectedImageName
                      : "Click to upload image"}
                  </label>
                </div>
              </div>

              {/* Ingredients */}
              <div className="bg-white rounded-md p-4">
                <label className="block font-medium mb-1">Ingredients</label>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search Ingredients"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#333]"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center gap-1"
                    >
                      <button
                        type="button"
                        onClick={() => handleIngredientToggle(ingredient.id)}
                        className={`px-3 py-1 border rounded-md ${
                          selectedIngredients.some(
                            (item) => item.id === ingredient.id
                          )
                            ? "bg-gray-800 text-white"
                            : "bg-white text-gray-800"
                        }`}
                      >
                        {ingredient.name}
                      </button>
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
                          className="w-16 h-8 p-1 border border-gray-300 rounded-md"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className={`bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md ${
                isFormValid() ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              disabled={loading || !isFormValid()}
              title={
                !isFormValid() ? "Please fill all the fields before adding" : ""
              }
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
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

export default AddMenuItem;
