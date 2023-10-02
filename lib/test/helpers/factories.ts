import { getFirestore } from "firebase-admin/firestore"

export type Recipe = {
  id: string
  title: string
  parentRecipeId?: string | null
  parentRecipe?: Recipe
  recipexTags: RecipexTag[]
}

let recipeCount = 0

export async function setUpRecipe({
  parentRecipe,
  ...overrides
}: Partial<Recipe> = {}) {
  const properties = {
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
  name: string
  color: string
}

let tagCount = 0

export async function setUpTag(overrides: Partial<Tag> = {}) {
  const properties = {
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
  recipeId: string
  tagId: string
  recipe: Recipe
  tag: Tag
}

export async function setUpRecipexTag(
  overrides: Partial<RecipexTag> = {}
) {
  const recipe = overrides.recipe ?? (await setUpRecipe()).recipe
  const tag = overrides.tag ?? (await setUpTag()).tag

  const properties = {
    recipeId: recipe.id,
    tagId: tag.id,
  }

  const ref = await getFirestore()
    .collection("recipe-x-tag")
    .add(properties)

  const recipexTag = {
    id: ref.id,
    ...properties,
    tag,
  } as RecipexTag

  recipe.recipexTags.push(recipexTag)

  return { recipexTag, recipe, tag }
}
