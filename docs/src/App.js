import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Header from "./screens/Header";
import Home from "./screens/Home";
import Recipes from "./screens/Recipes";

const supabaseUrl = "https://eidijxjgqvvwpcqnduxz.supabase.co";
const supabaseKey = process.env.REACT_APP_SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [session, setSession] = useState(null);
  const [recipe, setRecipe] = useState([]);
  const [showPrompt, setShowPrompt] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeDescription, setRecipeDescription] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      localStorage.setItem("email", session.user.email);
      localStorage.setItem("uid", session.user.id);
      createUser(session.user.email, session.user.id);
    }
  }, [session]);

  const createUser = async (email, userId) => {
    const response = await fetch("http://localhost:3001/user/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        userId: userId,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("User created:", data.user);
    } else {
      console.error("Error creating user:", data.message);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("email");
    localStorage.removeItem("uid");
    setSession(null);
  };

  if (!session) {
    return (
      <div className="auth-container">
        <h1 className="title">Recipator 3000</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google"]}
        />
      </div>
    );
  } else {
    return (
      <Router>
        <Header
          signOut={signOut}
          showPrompt={showPrompt}
          setShowPrompt={setShowPrompt}
          recipe={recipe}
          setRecipe={setRecipe}
          recipeDescription={recipeDescription}
          setRecipeDescription={setRecipeDescription}
          selectedRecipe={selectedRecipe}
          setSelectedRecipe={setSelectedRecipe}
        />
        <Routes>
          <Route
            path="/"
            element={
              <Home
                showPrompt={showPrompt}
                setShowPrompt={setShowPrompt}
                recipe={recipe}
                setRecipe={setRecipe}
                recipeDescription={recipeDescription}
                setRecipeDescription={setRecipeDescription}
              />
            }
          />
          <Route
            path="/home"
            element={
              <Home
                showPrompt={showPrompt}
                setShowPrompt={setShowPrompt}
                recipe={recipe}
                setRecipe={setRecipe}
                recipeDescription={recipeDescription}
                setRecipeDescription={setRecipeDescription}
              />
            }
          />
          <Route
            path="/recipes"
            element={
              <Recipes
                selectedRecipe={selectedRecipe}
                setSelectedRecipe={setSelectedRecipe}
              />
            }
          />
        </Routes>
      </Router>
    );
  }
}
