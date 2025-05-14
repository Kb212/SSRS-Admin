import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MessageModal from "../ui/MessageModal";

function UpdateMenuItem() {
  const { menuitemsid } = useParams(); // Get menu item ID from URL
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes, ingredientsRes, menuItemRes] =
          await Promise.all([
            fetch(`${import.meta.env.VITE_BASE_URL}/api/categories`),
            fetch(`${import.meta.env.VITE_BASE_URL}/api/tags`),
            fetch(`${import.meta.env.VITE_BASE_URL}/api/ingredients`),
            fetch(`${import.meta.env.VITE_BASE_URL}/api/menuitems/${menuitemsid}`),
          ]);

        const categories = await categoriesRes.json();
        const tags = await tagsRes.json();
        const ingredients = await ingredientsRes.json();
        const menuItem = await menuItemRes.json();

        setCategories(categories);
        setTags(tags);
        setIngredients(ingredients.ingredients);

        // Prefill form fields with menu item data
        setName(menuItem.name);
        setPrice(menuItem.price);
        setCategoryId(menuItem.category_id);
        setDescription(menuItem.description);
        setSelectedTags(menuItem.tags.map((tag) => tag.id));
        setImage(menuItem.image);

        // Map ingredients with their quantities from the pivot field
        setSelectedIngredients(
          menuItem.ingredients.map((ingredient) => ({
            id: ingredient.id,
            name: ingredient.name,
            quantity: ingredient.pivot.quantity,
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [menuitemsid]);

  const handleCategoryToggle = (categoryId) => {
    setCategoryId(categoryId);
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags((prevTags) => {
      if (prevTags.includes(tagId)) {
        return prevTags.filter((id) => id !== tagId);
      } else {
        return [...prevTags, tagId];
      }
    });
  };

  const handleIngredientToggle = (ingredientId) => {
    setSelectedIngredients((prev) => {
      const ingredientIndex = prev.findIndex(
        (item) => item.id === ingredientId
      );

      if (ingredientIndex === -1) {
        return [...prev, { id: ingredientId, quantity: "" }];
      } else {
        const updatedIngredients = [...prev];
        updatedIngredients.splice(ingredientIndex, 1);
        return updatedIngredients;
      }
    });
  };

  const handleIngredientQuantityChange = (ingredientId, quantity) => {
    setSelectedIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.id === ingredientId
          ? { ...ingredient, quantity: quantity }
          : ingredient
      )
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setNewImage(file);
      setSelectedImageName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Ensure all required fields are present
    if (!name || !price || !categoryId) {
      setModalStatus(false);
      setModalMessage("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    // Construct the FormData object
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("category_id", categoryId);

    // Append tags as an array
    selectedTags.forEach((tagId) => {
      formData.append("tags[]", tagId);
    });

    // Append ingredients as an array of objects
    selectedIngredients.forEach((ingredient, index) => {
      formData.append(`ingredients[${index}][ingredient_id]`, ingredient.id);
      formData.append(`ingredients[${index}][quantity]`, ingredient.quantity);
    });

    // Append the image if it exists
    if (newImage) {
      formData.append("image", image);
    }

    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/menuitems/${menuitemsid}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json", // Let the browser set the Content-Type for FormData
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to update menu item");
      }

      setModalStatus(true);
      setModalMessage(data.message || "Menu item updated successfully!");
      setTimeout(() => {
        navigate("/menuitems");
      }, 1000);
    } catch (error) {
      console.error("Error updating menu item:", error);
      setModalStatus(false);
      setModalMessage(error.message || "Failed to update menu item.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      name &&
      price &&
      categoryId &&
      description
    );
  };

  return (
    <section className="p-6">
      <div className="w-full">
        <div className="flex justify-between items-center pr-8 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Update Menu Item</h1>
            <p className="text-gray-500">
              Update the details of the menu item here
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
                <div
                  className="border border-dashed border-gray-300 rounded-md p-4 text-center relative group"
                  style={{
                    backgroundImage: newImage
                      ? `url(${URL.createObjectURL(image)})`
                      : image
                      ? `url(${import.meta.env.VITE_BASE_URL}/storage/${image})`
                      : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "200px",
                  }}
                >
                  <input
                    type="file"
                    id="image"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {selectedImageName || "Click to update image"}
                  </label>
                </div>
              </div>

              {/* Ingredients */}
              <div className="bg-white rounded-md p-4">
                <label className="block font-medium mb-1">Ingredients</label>
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
                !isFormValid()
                  ? "Please fill all the fields before updating"
                  : ""
              }
            >
              {loading ? "Updating..." : "Update"}
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

export default UpdateMenuItem;
