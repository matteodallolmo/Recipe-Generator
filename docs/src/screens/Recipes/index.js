import { useState, useEffect } from "react";
import { Button } from "@tremor/react";
import html2pdf from "html2pdf.js";
import axios from "axios";

export default function Recipes(props) {
  const [recipes, setRecipes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState(null);

  useEffect(() => {
    const uid = localStorage.getItem("uid");

    if (uid) {
      axios
        .get("http://localhost:3001/user/recipes", { headers: { uid: uid } })
        .then((response) => {
          setRecipes(response.data);
        })
        .catch((error) => {
          console.error("Error fetching recipes:", error);
        });
    }
  }, [props.selectedRecipe]);

  const handleRecipeClick = (recipe) => {
    props.setSelectedRecipe(recipe);
  };

  const handleBackClick = () => {
    props.setSelectedRecipe(null);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedRecipe({ ...props.selectedRecipe });
  };

  const handleSaveClick = async () => {
    try {
      const uid = localStorage.getItem("uid");

      if (!uid || !editedRecipe._id) {
        console.error("User ID or Recipe ID is missing");
        return;
      }

      const response = await fetch("http://localhost:3001/user/update-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: uid,
          recipeId: editedRecipe._id,
          updatedRecipe: editedRecipe,
        }),
      });

      if (response.status === 200) {
        console.log("Recipe updated successfully");
        props.setSelectedRecipe(editedRecipe);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
    }
  };

  const handleDiscardClick = () => {
    setIsEditing(false);
    setEditedRecipe(null);
  };

  const handleIngredientChange = (index, event) => {
    const updatedIngredients = [...editedRecipe.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      amount: event.target.value,
    };
    setEditedRecipe({ ...editedRecipe, ingredients: updatedIngredients });
  };

  const handleStepChange = (index, event) => {
    const updatedSteps = [...editedRecipe.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      description: event.target.value,
    };
    setEditedRecipe({ ...editedRecipe, steps: updatedSteps });
  };

  async function handleDeleteClick(recipe) {
    try {
      const uid = localStorage.getItem("uid");

      if (!uid || !recipe._id) {
        console.error("User ID or Recipe ID is missing");
        return;
      }

      const response = await fetch("http://localhost:3001/user/delete-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: uid,
          recipeId: recipe._id,
        }),
      });

      if (response.status === 200) {
        console.log("Recipe deleted successfully");
        props.setSelectedRecipe(null);
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  }
  const handleExportClick = () => {
    if (props.selectedRecipe) {
      const recipeHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4A90E2; text-align: center;">${
            props.selectedRecipe.title
          }</h2>
          <h4 style="color: #333;">Servings: ${
            props.selectedRecipe.servings || "N/A"
          }</h4>
          
          <h3 style="color: #333; margin-top: 20px;">Ingredients:</h3>
          <ul style="list-style-type: none; padding: 0; margin: 0;">
            ${props.selectedRecipe.ingredients
              .map(
                (ingredient) => `
                <li style="margin-bottom: 8px;">
                  <span style="font-weight: bold;">${
                    ingredient.amount || ""
                  }</span> ${ingredient.ingredient || ""}
                </li>`
              )
              .join("")}
          </ul>
  
          <div style="page-break-inside: avoid;">
          <h3 style="color: #333; margin-top: 20px;">Steps to Prepare:</h3>
          <ol style="padding-left: 20px;">
            ${props.selectedRecipe.steps
              .map(
                (step, index) => `
                <li style="margin-bottom: 10px;">
                  ${index + 1}. ${step.description}
                </li>`
              )
              .join("")}
          </ol>
        </div>
      </div>
    `;

      const options = {
        margin: 1,
        filename: `${props.selectedRecipe.title}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: ["div", "p"] },
      };

      html2pdf().from(recipeHtml).set(options).save();
    }
  };

  return (
    <div className="p-4">
      {!props.selectedRecipe ? (
        <div>
          <h1 className="text-3xl font-bold mb-4">Saved Recipes</h1>
          <div>
            {recipes.length === 0 ? (
              <p>No recipes saved yet!</p>
            ) : (
              recipes.map((recipe) => (
                <div
                  key={recipe._id}
                  onClick={() => handleRecipeClick(recipe)}
                  className="p-4 mb-4 bg-gray-100 rounded-lg cursor-pointer shadow-md"
                >
                  <h2 className="text-xl font-semibold">{recipe.title}</h2>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-full max-w-[800px] p-6 bg-[#f9f9f9] rounded-md shadow-lg relative">
            <h1 className="text-3xl font-bold text-center">
              {props.selectedRecipe.title || "Recipe"}
            </h1>

            <h2 className="text-2xl font-bold mb-6 text-center">
              {"Serves " + (props.selectedRecipe.servings || "")}
            </h2>

            <div className="ingredients mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-center">
                Ingredients
              </h2>
              <ul className="list-disc pl-5">
                {isEditing ? (
                  editedRecipe.ingredients.map((item, index) => (
                    <li key={index} className="mb-2 text-lg text-left">
                      <input
                        type="text"
                        value={item.amount}
                        onChange={(e) => handleIngredientChange(index, e)}
                        className="border p-1 rounded"
                      />
                      {item.ingredient}
                    </li>
                  ))
                ) : props.selectedRecipe.ingredients &&
                  props.selectedRecipe.ingredients.length > 0 ? (
                  props.selectedRecipe.ingredients.map((item, index) => (
                    <li key={index} className="mb-2 text-lg text-left">
                      {item.amount} {item.ingredient}
                    </li>
                  ))
                ) : (
                  <li className="text-lg text-left">No ingredients listed.</li>
                )}
              </ul>
            </div>

            <div className="steps mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-center">
                Steps to Prepare
              </h2>
              {isEditing ? (
                editedRecipe.steps.map((step, index) => (
                  <p key={index} className="mb-4 text-lg text-left">
                    <textarea
                      value={step.description}
                      onChange={(e) => handleStepChange(index, e)}
                      className="border p-1 rounded w-full"
                      rows={3}
                    />
                  </p>
                ))
              ) : props.selectedRecipe.steps &&
                props.selectedRecipe.steps.length > 0 ? (
                props.selectedRecipe.steps.map((step, index) => (
                  <p key={index} className="mb-4 text-lg text-left">
                    <b>{step.title}:</b> {step.description}
                  </p>
                ))
              ) : (
                <p className="text-lg text-left">No steps provided.</p>
              )}
            </div>

            <div className="flex-col">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSaveClick}
                    className="bg-blue-500 text-white p-2 rounded-md -mb-0.5 -mt-2"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={handleDiscardClick}
                    className="p-2 border-2 border-blue-500 bg-white-500 text-blue-500 rounded-md shadow flex justify-center items-center gap-[3.17px] hover:bg-gray-300 hover:text-blue-700"
                  >
                    Discard
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleBackClick}
                    className="justify-center items-center bg-blue-500 text-white p-2 rounded-md -mb-0.5"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleEditClick}
                    className="justify-center items-center p-2 border-2 border-blue-500 bg-white text-blue-500 rounded-md shadow flex hover:bg-gray-300 hover:text-blue-700 -mb-0.5"
                  >
                    Edit Recipe
                  </Button>
                  <Button
                    onClick={handleExportClick}
                    className="justify-center items-center p-2 bg-gray-500 text-white rounded-md shadow hover:bg-gray-600 -mb-0.5"
                  >
                    Export Recipe
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(props.selectedRecipe)}
                    className="p-2 bg-red-500 text-white rounded-md shadow justify-center items-center gap-[3.17px] flex hover:bg-red-600"
                  >
                    Delete Recipe
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
