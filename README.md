<b>firestore-relational</b> allows you to specify a set of relations between your firestore collections, and maintains those relations by copying documents onto their relations whenever they are added/removed/updated.

### Getting started

Install the package in your Firebase Functions project:

```
cd functions
yarn add firestore-relational
```

Then define your schema in your functions file:

```js
// functions/index.js

const {
  getFirebaseFunctions,
  project,
  collection,
  hasMany,
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
```

If you want to migrate existing data, you'll need to hit the migrate endpoint for each collection:

```bash
curl "http://127.0.0.1:4001/[your-project-id]/us-central1/relational-migrate" \
  -d "{ \"data\": { \"collectionPath\": \"recipes\" } }" \
  -X POST \
  -H "Content-Type: application/json; charset=utf-8" \
```

Then you will be able to query the recipes collection with all of the subrecipes embedded. Ex:

```json
[
  {
    "name": "Pancakes",
    "parentRecipeId": null,
    "subrecipes": [
      {
        "name": "Gluten Free Pancakes"
      }
    ]
  },
  {
    "name": "Gluten Free Pancakes",
    "parentRecipeId": "02Ovyo4SCaDy8H4xSyDj",
    "subrecipes": []
  }
]
```
