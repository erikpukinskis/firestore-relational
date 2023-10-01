const { initializeApp } = require("firebase-admin/app")
const { onRequest } = require("firebase-functions/v1/https")

initializeApp()

exports.migrate = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(404).send("404 Not Found")
  }

  const { collectionPath } = JSON.parse(req.body) ?? "foo"

  res.json({
    message: "This is where we would migrate",
    collectionPath,
  })
})

exports.fixtureFilename = onRequest((_, res) => {
  res.status(200).send("recipes-have-recipes.js")
})
