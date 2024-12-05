import React, { useState } from "react";
import { Dialog, DialogPanel, Button } from "@tremor/react";
import OpenAI from "openai";

export default function Home(props) {
  const openai = new OpenAI({
    apiKey: atob(process.env.REACT_APP_OPENAI_API_KEY + "="),
    dangerouslyAllowBrowser: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [successfulSave, setSuccessfulSave] = useState(false);
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [failedSave, setFailedSaved] = useState(false);
  const [failedGenerate, setFailedGenerate] = useState(false);

  async function generateRecipe() {
    setFailedGenerate(false);
    setIsLoading(true);
    try {
      const context = `You are a recipe generating assistant. You will be given the name of a dish, a brief description of a dish, or a list of ingredients that the person has available. 
      Your job is to help someone with minimal cooking experience to make the dish they have described or to suggest a recipe for a dish they could make with their ingredients + basic household items. 
      You should include a list of ingredients and ingredient amounts.
      You should then list out step-by-step instructions starting with food prep and then actual cooking. Your instructions should be clear and not overly technical, 
      so a beginner could understand them. Try to be succinct, as people don't want to read too much. Get to the point but be clear. Include how many servings the recipe makes in "servings".
      Include the title of the dish in "title".
      Default the simpler version of a dish. For example, if you are asked for a pasta recipe, assume they are using store-bought pasta, not making their own. 
      Your output is to be purely well-formatted JSON. Do not output anything except JSON. Do not start your output with any text, just JSON.
      For example, if I gave you a recipe titled "Seafood Pasta", your output would be something like the following:
      {"title":"Seafood Pasta","servings":2,"ingredients":[{"ingredient":"Spaghetti","amount":"400g"},{"ingredient":"Shrimp","amount":"200g"},{"ingredient":"Mussels","amount":"200g"},{"ingredient":"Clams","amount":"200g"},{"ingredient":"Calamari","amount":"150g"},{"ingredient":"Olive oil","amount":"2 tablespoons"},{"ingredient":"Garlic cloves","amount":"3 cloves"},{"ingredient":"Cherry tomatoes","amount":"200g"},{"ingredient":"White wine","amount":"100ml"},{"ingredient":"Parsley","amount":"2 tablespoons (chopped)"},{"ingredient":"Red chili flakes","amount":"1/2 teaspoon"},{"ingredient":"Salt","amount":"To taste"},{"ingredient":"Black pepper","amount":"To taste"}],"steps":[{"title":"Example Step Title","description":"Detailed description of the step"}]}`;

      let prompt = [
        { role: "system", content: context },
        {
          role: "user",
          content: `This is the dish/dish description for which you are to generate a recipe for: ${props.recipeDescription}. Generate a recipe and output only JSON.`,
        },
      ];

      const response = await openai.chat.completions.create({
        messages: prompt,
        model: "gpt-4",
      });
      if (response) {
        setIsLoading(false);
      }

      if (response.choices[0]) {
        const obj = JSON.parse(response.choices[0].message.content);
        obj._id = response.id;
        props.setRecipe(obj);
        props.setShowPrompt(false);
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
      setFailedGenerate(true);
      setIsOpen(true);
    }
  }

  async function saveRecipe(recipe) {
    const uid = localStorage.getItem("uid");

    if (!uid) {
      console.error("No user ID found in localStorage.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/user/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: uid,
          recipe: recipe,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Recipe saved successfully:", data);
        setSuccessfulSave(true);
        setIsOpen(true);
        setFailedSaved(false);
        setAlreadySaved(false);
      } else {
        console.error("Error saving recipe:", data.message);
        setSuccessfulSave(false);
        setFailedSaved(false);
        setAlreadySaved(true);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Failed to save recipe:", error);
      setSuccessfulSave(false);
      setFailedSaved(true);
      setAlreadySaved(false);
      setIsOpen(true);
    }
  }

  return (
    <div className="flex flex-col justify-start items-center h-[90vh] bg-[#ffffff] overflow-y-scroll p-4">
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} static={true}>
        <DialogPanel className="p-4 bg-white rounded-md shadow-md">
          {successfulSave && (
            <p className="text-green-600 font-semibold text-lg mb-4">
              Recipe saved successfully!
            </p>
          )}

          {alreadySaved && (
            <p className="text-red-600 font-semibold text-lg mb-4">
              Recipe already saved!
            </p>
          )}

          {failedGenerate && (
            <p className="text-red-600 font-semibold text-lg mb-4">
              I don't recognize this recipe. Failed to generate!
            </p>
          )}

          {failedSave && (
            <p className="text-red-600 font-semibold text-lg mb-4">
              Failed to save recipe.
            </p>
          )}

          <Button
            className="w-[100%] h-[46.77px] px-[20.77px] py-[10.38px] bg-blue-500 rounded-[10.27px] shadow justify-center items-center hover:bg-blue-400"
            onClick={() => {
              setSuccessfulSave(false);
              setAlreadySaved(false);
              setFailedSaved(false);
              setIsOpen(false);
            }}
          >
            <div className="text-white text-sm font-medium font-['Inter'] leading-tight">
              Done
            </div>
          </Button>
        </DialogPanel>
      </Dialog>
      {props.showPrompt && (
        <div className="text-center text-black flex flex-col items-center">
          <h1 class="font-bold text-3xl">Recipator 3000</h1>
          <br />
          <p>
            Describe a dish, drink, dessert, or simply list some ingredients you
            have on hand.
          </p>
          <p>
            Our our recipe generator will give you something delicious to make.
          </p>
          <textarea
            value={props.recipeDescription}
            onChange={(e) => {
              props.setRecipeDescription(e.target.value);
            }}
            className="border rounded-md p-2 h-[20vh] w-[30vw] mt-4 text-black"
          ></textarea>
          <button
            onClick={async () => {
              await generateRecipe();
            }}
            className="mt-4 w-[20vh] whitespace-nowrap rounded-tremor-default bg-tremor-brand py-2 text-center text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted dark:shadow-dark-tremor-input dark:hover:bg-dark-tremor-brand-emphasis"
          >
            Submit
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center h-[10vh]">
          <div className="w-10 h-10 border-4 border-tremor-brand border-solid border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!props.showPrompt && props.recipe && (
        <div className="w-full max-w-[800px] p-6 bg-[#f9f9f9] rounded-md shadow-lg relative">
          <h1 className="text-3xl font-bold text-center">
            {props.recipe.title || "Recipe"}
          </h1>

          <h2 className="text-2xl font-bold mb-6 text-center">
            {"Serves " + props.recipe.servings || ""}
          </h2>

          <div className="ingredients mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Ingredients
            </h2>
            <ul className="list-disc pl-5">
              {props.recipe.ingredients &&
              props.recipe.ingredients.length > 0 ? (
                props.recipe.ingredients.map((item, index) => (
                  <li key={index} className="mb-2 text-lg text-left">
                    {item.amount} {item.ingredient}
                  </li>
                ))
              ) : (
                <li className="text-lg text-left">No ingredients listed.</li>
              )}
            </ul>
          </div>

          <div className="steps">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Steps to Prepare
            </h2>
            {props.recipe.steps && props.recipe.steps.length > 0 ? (
              props.recipe.steps.map((step, index) => (
                <p key={index} className="mb-4 text-lg text-left">
                  <b>{step.title}:</b> {step.description}
                </p>
              ))
            ) : (
              <p className="text-lg text-left">No steps provided.</p>
            )}
          </div>

          <Button
            style={{ position: "relative", left: "-17px" }}
            className="ml-4"
            size="lg"
            color="blue"
            onClick={async () => {
              await saveRecipe(props.recipe);
            }}
          >
            Save Recipe
          </Button>

          <Button
            onClick={() => {
              props.setShowPrompt(true);
              props.setRecipe(null);
              props.setRecipeDescription("");
            }}
            className="p-2 border-2 border-blue-500 bg-white-500 text-blue-500 rounded-md shadow flex justify-center items-center gap-[3.17px] hover:bg-gray-300 hover:text-blue-700 -mb-0.5 -mt-0.5"
          >
            Back to Home
          </Button>
        </div>
      )}
    </div>
  );
}
