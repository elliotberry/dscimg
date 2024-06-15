import "dotenv/config"
import exists from "elliotisms/lib/exists.js"
import returnSafeFilePath from "elliotisms/lib/return-safe-filePath.js"
import fs from "node:fs/promises"
import path from "node:path"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import truncateFilename from "elliotisms/lib/truncate-filename.js"
import { ask } from "./ask.js"
import { validateAndFormatInput } from "./file-path-argument.js"
import filterInputs from "./lib/filters.js"
const argv = yargs(hideBin(process.argv))
  .option("debug", {
    alias: "d",
    description: "Enable debug mode",
    type: "boolean"
  })
  .option("rename", {
    alias: "r",
    default: false,
    description: "Enable rename mode",
    type: "boolean"
  })
  .help().argv

const main = async (input) => {
  if (!process.env.CF_ENDPOINT || !process.env.CF_AI_TOKEN) {
    console.error(
      "Please set the CF_ENDPOINT and CF_AI_TOKEN environment variables."
    )
    process.exit(1)
  }
  process.env.DEBUG_ON = argv.debug === true ? true : false;

  let inputs = await validateAndFormatInput(input)
  const initialLength = inputs.length
 
  let filteredInputs = await filterInputs(inputs)

  const finalLength = filteredInputs.length
  console.log(
    `Filtered ${initialLength - finalLength} files for a total of ${finalLength} files.`
  )
  if (!argv.rename) {
    return
  }
  console.log("Renaming files...")
  let index = 0
  for await (const file of inputs) {
    const content = await fs.readFile(file)
    const filename = await ask(content, inputs[index])
    if (filename === null) {
      console.log(`problem with file ${inputs[index]}`)
    } else {
      const ogfilename = path.basename(
        inputs[index],
        path.extname(inputs[index])
      )

      const newFilename = path.join(
        path.dirname(inputs[index]),
        `${filename}${path.extname(inputs[index])}`
      )
      const finalFilename = await returnSafeFilePath(newFilename)
      if (await exists(finalFilename)) {
        console.warn(`File ${finalFilename} already exists, skipping`)
      } else {
        await fs.rename(inputs[index], finalFilename)
        console.log(
          `Renamed ${truncateFilename(inputs[index])} to ${truncateFilename(
            finalFilename
          )}`
        )
      }
    }
    index++
  }
}

main(argv._[0])
