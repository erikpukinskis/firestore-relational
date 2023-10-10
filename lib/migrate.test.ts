import fetch from "cross-fetch"
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest"
import {
  deleteAllDocuments,
  deployFixtureFunctions,
  getFunctionUrl,
  getRecipe,
  setUpRecipe,
  setUpRecipexTag,
  setUpTag,
  withFirebaseEmulators,
} from "~/test/helpers"
import { hash } from "./helpers"
import { collection, hasMany, hasOne } from "./relations"

/**
 * KEEP THIS UPDATED TO MATCH WHAT'S IN recipes-have-tags.js
 */
const RECIPES_SCHEMA_HASH = hash(
  collection("recipes", {
    "recipexTags": hasMany({
      localKey: "id",
      foreignKey: "recipeId",
      collection: collection("recipexTags", {
        tag: hasOne({
          collection: "tags",
          localKey: "tagId",
          foreignKey: "id",
        }),
      }),
    }),
  })
)

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

  beforeEach(deleteAllDocuments)

  it("should migrate recursive children", async () => {
    const { tag } = await setUpTag({ name: "blue corn" })
    const { recipe } = await setUpRecipe({ title: "Tlacoyos" })
    await setUpRecipexTag({ tag, recipe })

    await deployFixtureFunctions("recipes-have-tags.js")

    const response = await fetch(
      getFunctionUrl("relational-migrate"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          data: { collectionPath: "recipes" },
        }),
      }
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({
      result: {
        collectionPath: "recipes",
      },
    })

    const updatedRecipe = await getRecipe(recipe.id)

    expect(updatedRecipe).toHaveProperty("recipexTags")
    expect(updatedRecipe.recipexTags).toHaveLength(1)
    expect(updatedRecipe.recipexTags[0]).toMatchObject({
      tagId: tag.id,
    })
    expect(updatedRecipe.recipexTags[0].tag).toMatchObject({
      name: "blue corn",
    })
  })

  it("should not migrate anything whose schema hash already matches", async () => {
    const { tag } = await setUpTag({ name: "blue corn" })
    const { recipe: mush } = await setUpRecipe({
      title: "Blue Corn Mush",
    })
    const { recipe: tlacoyos } = await setUpRecipe({
      title: "Tlacoyos",
      __firestoreRelationalSchemaHash: RECIPES_SCHEMA_HASH,
    })
    await setUpRecipexTag({ tag, recipe: mush })
    await setUpRecipexTag({ tag, recipe: tlacoyos })

    await deployFixtureFunctions("recipes-have-tags.js")

    const response = await fetch(
      getFunctionUrl("relational-migrate"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({
          data: { collectionPath: "recipes" },
        }),
      }
    )

    expect(response.status).toBe(200)

    const updatedTlacoyos = await getRecipe(tlacoyos.id)
    const updatedMush = await getRecipe(mush.id)

    expect(updatedMush).toHaveProperty("recipexTags")
    expect(updatedTlacoyos).not.toHaveProperty("recipexTags")
  })

  it("should decrease the LIMIT if a repsonse is too large")
})
