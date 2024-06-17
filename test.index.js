import { describe, it, beforeEach, afterEach, test } from "node:test"
import assert from "node:assert"

import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import exec from "elliotisms/lib/exec.js"

const originalImagePath = "./test.jpg"

describe("tests", async () => {
    beforeEach(async (t) => {
        t.tempFilePath = path.join(os.tmpdir(), "test.jpg")
        await fs.promises.copyFile(originalImagePath, t.tempFilePath)
    })

    afterEach(async (t) => {
        // await fs.promises.unlink(tempFilePath);
        //  if (newFileName) {
        //      await fs.promises.unlink(newFileName); // Delete the renamed file
        //       await fs.promises.copyFile(tempFilePath, originalImagePath); // Restore the original
        //  }
    })

    it("should run index.js, rename the image, and return no errors", async (t) => {
  
        await exec(`node ./index.js "${t.tempFilePath}"`)

        let filesInTMP = await fs.promises.readdir(os.tmpdir())

        let hasTheRenamedFile =
            filesInTMP.find(
                (file) => file.endsWith(".jpg") && file !== "test.jpg" && file.indexOf("watermelon") > -1
            ) !== undefined
        assert.ok(
            hasTheRenamedFile,
            "correct new JPG file was found after running index.js: " + filesInTMP
        )

    })
})
