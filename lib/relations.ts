export type FirestoreProjectSchema = {
  collections: CollectionSchema[]
}

export function project(
  collections: CollectionSchema[]
): FirestoreProjectSchema {
  return { collections }
}

export type CollectionSchema = {
  path: string
  relations: Record<string, Relation>
}

export function collection(
  path: string,
  fields: Record<string, Relation> = {}
): CollectionSchema {
  const relations: Record<string, Relation> = {}

  for (const key in fields) {
    const relation = fields[key]
    relations[key] = relation
  }

  return { path, relations }
}

export type Relation = {
  type: "has-many" | "has-one"
  collection: CollectionSchema
  localKey: string
  foreignKey: string
}

type Relationargs = {
  collection: CollectionSchema | string
  localKey: string
  foreignKey: string
}

export function hasMany(args: Relationargs): Relation {
  return {
    type: "has-many",
    ...args,
    collection:
      typeof args.collection === "string"
        ? collection(args.collection)
        : args.collection,
  }
}

export function hasOne(args: Relationargs): Relation {
  return {
    type: "has-one",
    ...args,
    collection:
      typeof args.collection === "string"
        ? collection(args.collection)
        : args.collection,
  }
}
