import fetch from "cross-fetch"
import { cpSync } from "fs"
import { expect } from "vitest"
import { initializeApp } from "firebase-admin/app"
import { execSync } from "child_process"

const FIRESTORE_EMULATOR_HOST = "127.0.0.1:4002"
const FIRESTORE_FUNCTIONS_HOST = "127.0.0.1:4001"
const FIRESTORE_PROJECT = "firestore-relational-test"

/**
 * Deploys a set of Firestore Functions from the test/fixtures folder to the
 * local emulator suite. The emulators must be running first (yarn
 * start:emulators).
 *
 * The fixture MUST include a function called fixtureFilename that returns the
 * exact filename that the funcftions are defined in, including extension.
 */
export async function deployFixtureFunctions(
  fixtureFilename: string
) {
  // Make sure the file compiles
  cpSync(
    "dist/lib.umd.js",
    "lib/test/fixtures/firestore-relational.js"
  )
  execSync(`node lib/test/fixtures/${fixtureFilename}`)

  // If we are debugging in Chrome, we don't want to copy over the file because
  // it will cause the inspector to disconnect
  if (process.env.DEPLOY_TEST_FUNCTIONS === "false") {
    console.warn(
      "Skipping deploy of test functions; using whatever is in functions/index.js"
    )
  } else {
    // But for running the full test suite of course we'll need to copy over the
    // files. Both the current version of firestore-relational and the fixture
    // functions file
    cpSync(
      "dist/lib.umd.js",
      "functions/firestore-relational.js"
    )
    cpSync(
      `lib/test/fixtures/${fixtureFilename}`,
      "functions/index.js"
    )
  }

  // We do want to check to make sure the fixture was loaded successfully. All
  // of the fixtures should implement this endpoint:
  const response = await fetch(getFunctionUrl("fixtureFilename"))
  const text = await response.text()

  expect(text).toBe(fixtureFilename)
}

/**
 * Returns the url of the given Firebase Function running on the local emulator
 * suite.
 */
export function getFunctionUrl(functionName: string) {
  return `http://${FIRESTORE_FUNCTIONS_HOST}/${FIRESTORE_PROJECT}/us-central1/${functionName}`
}

type SetupTeardownFunction = (
  callback: () => void | Promise<void>
) => void

/**
 * Sets up the Firebase emulators to work with the tests.
 */
export function withFirebaseEmulators(
  beforeAll: SetupTeardownFunction,
  afterAll: SetupTeardownFunction
) {
  beforeAll(async () => {
    connectToEmulators()
    initializeApp({
      projectId: FIRESTORE_PROJECT,
    })
    // await deployFixtureFunctions("none.js")
    await deleteAllDocuments()
  })
}

export const connectToEmulators = () => {
  if (process.env["EMULATING_FIREBASE"]) return

  process.env["FIRESTORE_EMULATOR_HOST"] =
    FIRESTORE_EMULATOR_HOST
  process.env["EMULATING_FIREBASE"] = "true"

  console.info(`Connected to Firebase emulators.`)
}

/**
 * Deletes all of the documents from the Firestore emulators, to create a clean
 * test environment for the next test.
 */
export async function deleteAllDocuments() {
  await fetch(
    `http://${FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents`,
    {
      method: "DELETE",
    }
  )
}
