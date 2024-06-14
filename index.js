import fs from "node:fs/promises"
import path from "node:path"
import "dotenv/config"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { ask } from "./ask.js"
import { validateAndFormatInput } from "./file-path-argument.js"
import exists  from "elliotisms/lib/exists.js"
const argv = yargs(hideBin(process.argv))
  .option("debug", {
    alias: "d",
    type: "boolean",
    description: "Enable debug mode"
  })
  .option("rename", {
    alias: "r",
    type: "boolean",
    description: "Enable rename mode"
  })
  .help().argv

const main = async (input) => {
  argv.debug === true ?
    (process.env.DEBUG_ON = true)
  : (process.env.DEBUG_ON = false)

  let inputs = await validateAndFormatInput(input)

  // if (argv.debug) {
  console.log("Validated inputs:", inputs)
  // }

  //filter the array of files to only include images under 1mb
  // inputs = inputs.filter(async (file) => {
  //   let stats = await fs.stat(file)
  //   return stats.size < 1000000
  // }).map((file) => path.resolve(file))
  



  let fileContents = await Promise.all(inputs.map((file) => fs.readFile(file)))

  if (argv.debug) {
    console.log("File contents read successfully")
  }

  let results = await Promise.all(fileContents.map(ask))

  for (const [index, result] of results.entries()) {
    if (result !== null) {
    let filename = path.basename(inputs[index], path.extname(inputs[index]))
    console.log(
      `${filename}${path.extname(inputs[index])} -> ${result}${path.extname(inputs[index])}`
    )
    if (argv.rename) {
      let newFilename = path.join(
        path.dirname(inputs[index]),
        `${result}${path.extname(inputs[index])}`
      )
      if (await exists(newFilename)) {
        throw new Error(`File ${newFilename} already exists`)
      } else {
        await fs.rename(inputs[index], newFilename)
      }
    }}
  }
}

main(argv._[0])
