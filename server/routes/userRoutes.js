const express = require("express");
const router = express.Router();

const User = require("../schemas/userSchema");

router.get("/test", async (req, res) => {
  res.status(200).json({ message: "Yipeeee" });
});

// Route to create a new user
router.post("/create", async (req, res) => {
  const { email, userId } = req.body;

  // Check if email already exists in the database
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "User with this email already exists." });
  }

  // Create new user
  const newUser = new User({
    email: email,
    _id: userId,
    recipes: [],
  });

  try {
    await newUser.save(); // Save the user to the database
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
});

router.post("/save", async (req, res) => {
  try {
    const { uid, recipe } = req.body;

    if (!uid || !recipe) {
      return res
        .status(400)
        .json({ message: "User ID and recipe are required." });
    }

    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if the recipe already exists
    const recipeExists = user.recipes.some(
      (existingRecipe) => existingRecipe._id.toString() === recipe._id
    );

    if (recipeExists) {
      return res
        .status(400)
        .json({ message: "This recipe has already been saved." });
    }

    user.recipes.push(recipe);

    await user.save();

    res
      .status(200)
      .json({ message: "Recipe saved successfully!", recipe: recipe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save recipe." });
  }
});

router.post("/delete-recipe", async (req, res) => {
  try {
    const { uid, recipeId } = req.body;

    if (!uid || !recipeId) {
      return res
        .status(400)
        .json({ message: "User ID and recipe ID are required." });
    }

    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const recipeIndex = user.recipes.findIndex(
      (recipe) => recipe._id.toString() === recipeId
    );

    if (recipeIndex === -1) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    user.recipes.splice(recipeIndex, 1);

    await user.save();

    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ message: "Failed to delete recipe." });
  }
});

router.get("/recipes", async (req, res) => {
  try {
    const uid = req.headers["uid"];

    if (!uid) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const recipes = user.recipes;

    res.status(200).json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch recipes." });
  }
});

router.post("/update-recipe", async (req, res) => {
  try {
    const { uid, recipeId, updatedRecipe } = req.body;

    if (!uid || !recipeId || !updatedRecipe) {
      return res.status(400).json({
        message: "User ID, Recipe ID, and Updated Recipe are required.",
      });
    }

    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const recipeIndex = user.recipes.findIndex(
      (recipe) => recipe._id.toString() === recipeId
    );

    if (recipeIndex === -1) {
      return res.status(404).json({ message: "Recipe not found." });
    }

    // Update the recipe fields
    user.recipes[recipeIndex].title =
      updatedRecipe.title || user.recipes[recipeIndex].title;
    user.recipes[recipeIndex].servings =
      updatedRecipe.servings || user.recipes[recipeIndex].servings;
    user.recipes[recipeIndex].ingredients =
      updatedRecipe.ingredients || user.recipes[recipeIndex].ingredients;
    user.recipes[recipeIndex].steps =
      updatedRecipe.steps || user.recipes[recipeIndex].steps;

    await user.save();

    res.status(200).json({
      message: "Recipe updated successfully",
      recipe: user.recipes[recipeIndex],
    });
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ message: "Failed to update recipe." });
  }
});

module.exports = router;
