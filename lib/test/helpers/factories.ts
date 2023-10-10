import { getFirestore } from "firebase-admin/firestore"

export type Recipe = {
  id: string
  createdAt: number
  title: string
  parentRecipeId?: string | null
  parentRecipe?: Recipe
  recipexTags: RecipexTag[]
}

type Migratable = {
  __firestoreRelationalSchemaHash?: string | null
}

let recipeCount = 0

export async function setUpRecipe({
  parentRecipe,
  ...overrides
}: Partial<Recipe> & Migratable = {}) {
  const properties = {
    createdAt: new Date().getTime(),
    title: `Recipe No.${++recipeCount}`,
    parentRecipeId: parentRecipe?.id ?? null,
    ...overrides,
  }

  const ref = await getFirestore()
    .collection("recipes")
    .add(properties)

  const recipe = {
    id: ref.id,
    ...properties,
    recipexTags: [],
  } as Recipe

  return { recipe }
}

export async function getRecipe(id: string) {
  const snapshot = await getFirestore()
    .doc(`recipes/${id}`)
    .get()

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Recipe
}

const COLOR_NAMES = [
  "blanchedalmond",
  "chocolate",
  "coral",
  "firebrick",
  "goldenrod",
  "lemonchiffon",
  "mistyrose",
  "moccasin",
  "papayawhip",
  "peachpuff",
  "seagreen",
  "tomato",
]

function getRandomColorName() {
  const index = Math.floor(
    Math.random() * (COLOR_NAMES.length - 1)
  )
  return COLOR_NAMES[index]
}

export type Tag = {
  id: string
  createdAt: number
  name: string
  color: string
}

let tagCount = 0

export async function setUpTag(
  overrides: Partial<Tag> & Migratable = {}
) {
  const properties = {
    createdAt: new Date().getTime(),
    name: `Tag No.${++tagCount}`,
    color: getRandomColorName(),
    ...overrides,
  }

  const ref = await getFirestore()
    .collection("tags")
    .add(properties)

  const tag = {
    id: ref.id,
    ...properties,
  } as Tag

  return { tag }
}

export type RecipexTag = {
  id: string
  createdAt: number
  recipeId: string
  tagId: string
  recipe: Recipe
  tag: Tag
}

export async function setUpRecipexTag(
  overrides: Partial<RecipexTag> & Migratable = {}
) {
  const recipe = overrides.recipe ?? (await setUpRecipe()).recipe
  const tag = overrides.tag ?? (await setUpTag()).tag

  const properties = {
    createdAt: new Date().getTime(),
    recipeId: recipe.id,
    tagId: tag.id,
  }

  const ref = await getFirestore()
    .collection("recipexTags")
    .add(properties)

  const recipexTag = {
    id: ref.id,
    ...properties,
    tag,
  } as RecipexTag

  recipe.recipexTags.push(recipexTag)

  return { recipexTag, recipe, tag }
}
