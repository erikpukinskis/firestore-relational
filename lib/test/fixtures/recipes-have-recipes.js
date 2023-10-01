const { initializeApp } = require("firebase-admin/app")
const { onRequest } = require("firebase-functions/v1/https")
const {
  project,
  collection,
  hasMany,
  getFirebaseFunctions,
} = require("./firestore-relational")

initializeApp()

exports.relational = getFirebaseFunctions(
  project([
    collection("recipes", {
      "subrecipes": hasMany({
        collection: "recipes",
        localKey: "id",
        foreignKey: "parentRecipeId",
      }),
    }),
  ])
)

exports.fixtureFilename = onRequest((_, res) => {
  res.status(200).send("recipes-have-recipes.js")
})
