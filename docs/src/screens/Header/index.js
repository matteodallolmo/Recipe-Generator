import React from "react";
import { useNavigate } from "react-router-dom";

export default function Header(props) {
  const navigation = useNavigate();

  const handleSignOut = () => {
    props.signOut();
    props.setShowPrompt(true);
    props.setRecipe(null);
    navigation("/");
  };

  return (
    <div>
      <div className="w-full px-6 py-2.5 bg-white shadow border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex gap-5">
            <p
              className={`header-2-picker-text cursor-pointer ${
                props.selectedTab === 0 ? "font-bold" : ""
              }`}
              onClick={() => {
                props.setShowPrompt(true);
                props.setRecipe(null);
                props.setRecipeDescription("");
                navigation("/home");
              }}
            >
              Home
            </p>
            <p
              className={`header-2-picker-text cursor-pointer ${
                props.selectedTab === 2 ? "font-bold" : ""
              }`}
              onClick={() => {
                props.setSelectedRecipe(null);
                navigation("/recipes");
              }}
            >
              Saved Recipes
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-[6%] min-w-[100px] bg-red-500 text-white p-1 rounded-md shadow hover:bg-red-600 absolute -top-0.5 right-4"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
