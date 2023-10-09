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
  sequenceKey?: string
  relations: Record<string, Relation>
}

export function collection(
  path: string,
  fields: Record<string, Relation | SequenceField> = {}
): CollectionSchema {
  const relations: Record<string, Relation> = {}
  let sequenceKey: string | undefined

  for (const key in fields) {
    const relation = fields[key]
    if (relation.type === "sequence-field") {
      sequenceKey = key
    } else {
      relations[key] = relation
    }
  }

  // if (!sequenceKey) {
  //   throw new Error(
  //     `Your collection must include a sequence field for ordering migrations. Try adding createdAt: sequenceField() to your ${path} schema.`
  //   )
  // }

  return { path, relations, sequenceKey }
}

type SequenceField = {
  type: "sequence-field"
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

export function sequenceField() {
  return { type: "sequence-field" } as SequenceField
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
