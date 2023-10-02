const { initializeApp } = require("firebase-admin/app")
const { onRequest } = require("firebase-functions/v1/https")
const {
  project,
  collection,
  hasMany,
  hasOne,
  getFirebaseFunctions,
} = require("./firestore-relational")

initializeApp()

exports.relational = getFirebaseFunctions(
  project([
    collection("recipes", {
      "tags": hasMany({
        collection: "recipexTags",
        localKey: "id",
        foreignKey: "recipeId",
      }),
    }),
    collection("recipexTags", {
      tag: hasOne({
        collection: "tags",
        localKey: "tagId",
        foreignKey: "id",
      }),
    }),
  ])
)

exports.fixtureFilename = onRequest((_, res) => {
  res.status(200).send("recipes-have-tags.js")
})