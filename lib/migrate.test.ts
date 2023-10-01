import fetch from "cross-fetch"
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
} from "vitest"
import {
  deployFixtureFunctions,
  getFunctionUrl,
  withFirebaseEmulators,
} from "~/test/helpers"

// schema([
//   collection("recipes", {
//     "subrecipes": hasMany({
//       collection: "recipes",
//       localKey: "id",
//       foreignKey: "parentRecipeId",
//     }),
//     "tags": hasMany({
//       collection: "recipe_tags",
//       localKey: "id",
//       foreignKey: "recipeId",
//     }),
//   }),

//   collection("recipe_tags", {
//     tag: hasOne({
//       collection: "tags",
//       localKey: "tagId",
//       foreignKey: "id",
//     }),
//   }),

//   collection("tags", {
//     attribute: hasOne({
//       collection: "attributes",
//       localKey: "attributeId",
//       foreignKey: "id",
//     }),
//   }),

//   collection("attributes", {
//     tags: hasMany({
//       collection: "tags",
//       localKey: "id",
//       foreignKey: "attributeId",
//     }),
//   }),

//   collection("meals", {
//     courses: hasMany({
//       collection: "courses",
//       localKey: "id",
//       foreignKey: "mealId",
//     }),
//   }),

//   collection("courses", {
//     recipe: hasOne({
//       collection: "recipes",
//       localKey: "recipeId",
//       foreignKey: "id",
//     }),
//   }),

//   collection("discussions", {
//     tags: hasMany({
//       collection: "highlights",
//       localKey: "id",
//       foreignKey: "discussionId",
//     }),
//   }),

//   collection("highlights", {
//     tags: hasOne({
//       collection: "recipes",
//       localKey: "recipeId",
//       foreignKey: "id",
//     }),
//   }),
// ])

describe("migrating existing collections", () => {
  withFirebaseEmulators(beforeAll, afterAll)

  it("should add recursive children but not grandchildren", async () => {
    await deployFixtureFunctions("recipes-have-recipes.js")

    const response = await fetch(
      getFunctionUrl("relational-migrate"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          data: { collectionName: "recipes" },
        }),
      }
    )

    expect(response.status).toBe(200)
  })
})
