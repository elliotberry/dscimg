import fs from "node:fs/promises"
import path from "node:path"
import "dotenv/config"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { ask } from "./ask.js"
import { validateAndFormatInput } from "./file-path-argument.js"
import exists from "elliotisms/lib/exists.js"
import returnSafeFilePath from "elliotisms/lib/return-safe-filePath.js"


const imageFileTypes = ["jpg", "jpeg", "png", "webp", "gif"]

const argv = yargs(hideBin(process.argv))
  .option("debug", {
    alias: "d",
    type: "boolean",
    description: "Enable debug mode"
  })
  .option("rename", {
    alias: "r",
    type: "boolean",
    description: "Enable rename mode",
    default: false
  })
  .help().argv

const main = async (input) => {
  argv.debug === true ?
    (process.env.DEBUG_ON = true)
  : (process.env.DEBUG_ON = false)

  let inputs = await validateAndFormatInput(input)
  //let g = await new fdir().withFullPaths().crawl(input).withPromise()
  let initialLength = inputs.length
  //filter the array of files to only include images under 1mb
  inputs = inputs
    .filter(async (file) => {
      let stats = await fs.stat(file)
      return stats.size < 1000000
    })
    .map((file) => path.resolve(file))

  inputs = inputs.filter((file) => {
    let ext = path.extname(file).slice(1)

    return imageFileTypes.includes(ext)
  })
  let finalLength = inputs.length
  console.log(
    `Filtered ${initialLength - finalLength} files for a total of ${finalLength} files.`
  )
  if (argv.rename) {
    console.log("Renaming files...")
    let index = 0
    for await (const file of inputs) {
      let content = await fs.readFile(file)
      let filename = await ask(content, inputs[index])
      if (filename === null) {
        console.log(`problem with file ${inputs[index]}`)
      } else {
        let ogfilename = path.basename(
          inputs[index],
          path.extname(inputs[index])
        )

        let newFilename = path.join(
          path.dirname(inputs[index]),
          `${filename}${path.extname(inputs[index])}`
        )
        let finalFilename = await returnSafeFilePath(newFilename)
        if (await exists(finalFilename)) {
          console.warn(`File ${finalFilename} already exists, skipping`)
        } else {
          await fs.rename(inputs[index], finalFilename)
        }
      }
      index++
    }
  }
}

main(argv._[0])
