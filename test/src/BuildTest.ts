import test from "./helpers/avaEx"
import { assertPack, modifyPackageJson } from "./helpers/packTester"
import { move, writeJson, readJson } from "fs-extra-p"
import { Promise as BluebirdPromise } from "bluebird"
import * as path from "path"

//noinspection JSUnusedLocalSymbols
const __awaiter = require("out/awaiter")

if (process.env.TRAVIS !== "true") {
  // we don't use CircleCI, so, we can safely set this env
  process.env.CIRCLE_BUILD_NUM = 42
}

test.ifOsx("mac: two-package.json", async () => {
  await assertPack("test-app", "darwin")
})

test.ifOsx("mac: one-package.json", async () => {
  await assertPack("test-app-one", "darwin")
})

test("custom app dir", async () => {
  await assertPack("test-app-one", getPossiblePlatforms(), {
    // speed up tests, we don't need check every arch
    arch: process.arch
  }, true, (projectDir) => {
    return BluebirdPromise.all([
      modifyPackageJson(projectDir, data => {
        data.directories = {
          buildResources: "custom"
        }
      }),
      move(path.join(projectDir, "build"), path.join(projectDir, "custom"))
    ])
  })
})

test("productName with space", async () => {
  await assertPack("test-app-one", getPossiblePlatforms(), {
    // speed up tests, we don't need check every arch
    arch: process.arch
  }, true, (projectDir) => {
    return modifyPackageJson(projectDir, data => {
      data.productName = "Test App"
    })
  })
})

function getPossiblePlatforms(): Array<string> {
  const isCi = process.env.CI != null
  if (process.platform === "darwin") {
    return isCi ? ["darwin", "linux"] : ["darwin", "linux", "win32"]
  }
  else if (process.platform === "linux") {
    // todo install wine on Linux agent
    return ["linux"]
  }
  else {
    return ["win32"]
  }
}