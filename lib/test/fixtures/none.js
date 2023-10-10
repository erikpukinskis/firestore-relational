const { onRequest } = require("firebase-functions/v1/https")

exports.fixtureFilename = onRequest((_, res) => {
  res.status(200).send("none.js")
})
