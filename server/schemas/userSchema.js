const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    recipes: [
      {
        _id: {
          type: String,
          required: true,
        },
        ingredients: [
          {
            ingredient: String,
            amount: String,
          },
        ],
        servings: Number,
        steps: [
          {
            title: String,
            description: String,
          },
        ],
        title: String,
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
