const { initializeApp } = require("firebase-admin/app")
const { onRequest } = require("firebase-functions/v1/https")
const {
  project,
  collection,
  sequenceField,
  hasMany,
  hasOne,
  getFirebaseFunctions,
} = require("./firestore-relational")

initializeApp()

exports.relational = getFirebaseFunctions(
  project([
    collection("recipes", {
      createdAt: sequenceField(),
      "recipexTags": hasMany({
        localKey: "id",
        foreignKey: "recipeId",
        collection: collection("recipexTags", {
          createdAt: sequenceField(),
          tag: hasOne({
            collection: "tags",
            localKey: "tagId",
            foreignKey: "id",
          }),
        }),
      }),
    }),
  ])
)

exports.fixtureFilename = onRequest((_, res) => {
  res.status(200).send("recipes-have-tags.js")
})
