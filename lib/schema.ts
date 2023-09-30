type Schema = {
  collections: CollectionSchema[]
}

export function schema(collections: CollectionSchema[]): Schema {
  return { collections }
}

type CollectionSchema = {
  path: string
  relations: Record<string, Relation>
}

export function collection(
  path: string,
  relations: Record<string, Relation>
): CollectionSchema {
  return { path, relations }
}

type Relation = {
  type: "has-many" | "has-one"
  collection: string
  localKey: string
  foreignKey: string
}

export function hasMany(args: {
  collection: string
  localKey: string
  foreignKey: string
}): Relation {
  return {
    type: "has-many",
    ...args,
  }
}

export function hasOne(args: {
  collection: string
  localKey: string
  foreignKey: string
}): Relation {
  return {
    type: "has-one",
    ...args,
  }
}
