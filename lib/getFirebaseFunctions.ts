import { Query, getFirestore } from "firebase-admin/firestore"
import { FirestoreProjectSchema, Relation } from "./relations"

type MigrateData = {
  collectionPath: string
}

import { onCall } from "firebase-functions/v2/https"

export function getFirebaseFunctions(
  schema: FirestoreProjectSchema
) {
  return {
    migrate: onCall<MigrateData>(
      { timeoutSeconds: 540 },
      async (request) => {
        console.log("migrate me!")
        debugger
        const { collectionPath } = request.data
        const collectionSchema = schema.collections.find(
          ({ path }) => path === collectionPath
        )
        if (!collectionSchema) {
          const paths = schema.collections.map(
            ({ path }) => path
          )
          throw new Error(
            `No schema found for collection with path ${collectionPath}. Schemas found for ${paths.join(
              ","
            )}`
          )
        }
        const { path, relations, sequenceKey } = collectionSchema
        const relationEntries = Object.entries(relations)
        const querySnapshot = await getFirestore()
          .collection(path)
          .get()
        for (const docSnapshot of querySnapshot.docs) {
          const data = {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }
          const relationData = await getRelationData(
            `${collectionPath}/${docSnapshot.id}`,
            data,
            relationEntries,
            schema
          )

          const jsonBefore = JSON.stringify(data)
          const jsonAfter = JSON.stringify({
            ...data,
            ...relationData,
          })
          const jsonRelational = JSON.stringify(relationData)

          if (
            jsonAfter === jsonBefore ||
            jsonRelational === "{}"
          ) {
            continue
          }

          console.log("diff!", {
            data,
            relationData,
            jsonRelational,
          })

          await getFirestore()
            .doc(`${collectionPath}/${docSnapshot.id}`)
            .update(relationData)
        }
        return {
          message: "This is where we would migrate",
          collectionPath,
        }
      }
    ),
  }
}

async function getRelationData(
  documentPath: string,
  data: Record<string, unknown>,
  relations: [string, Relation][],
  schema: FirestoreProjectSchema
) {
  const relationData: Record<string, unknown> = {}

  for (const [
    relationKey,
    { type, localKey, foreignKey, collection },
  ] of relations) {
    if (type === "has-many") {
      const localValue = data[localKey]
      if (localValue == null) {
        console.warn(
          `Tried to set up relation between document ${documentPath} and ${collection.path} but the ${localKey} field was not defined.`
        )
        continue
      }

      const querySnapshot = await getFirestore()
        .collection(collection.path)
        .where(foreignKey, "==", localValue)
        .get()

      const docs: unknown[] = []

      for (const docSnapshot of querySnapshot.docs) {
        const doc = {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }

        if (Object.keys(collection.relations).length > 1) {
          Object.assign(
            doc,
            await getRelationData(
              `${collection.path}/${docSnapshot.id}`,
              doc,
              Object.entries(collection.relations),
              schema
            )
          )
        }

        docs.push(doc)

        relationData[relationKey] = docs
      }
    } else if (type === "has-one") {
      console.log("has-one not yet supported")
    }
  }

  return relationData
}
