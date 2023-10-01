import { FirestoreProjectSchema } from "./relations"

type MigrateData = {
  collectionPath: string
}

import { https } from "firebase-functions"

export function getFirebaseFunctions(
  schema: FirestoreProjectSchema
) {
  return {
    migrate: https.onCall(async (data: MigrateData) => {
      const { collectionPath } = data

      return {
        message: "This is where we would migrate",
        collectionPath,
      }
    }),
  }
}
