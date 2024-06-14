import fs from "node:fs/promises"
import path from "node:path"
import "dotenv/config"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { ask } from "./ask.js"
import { validateAndFormatInput } from "./file-path-argument.js"
import exists from "elliotisms/lib/exists.js"
import { fdir } from "fdir"

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
    `Filtered ${initialLength - finalLength} files fora total of ${finalLength} files.`
  )
  if (argv.rename) {
    let fileContents = await Promise.all(
      inputs.map((file) => fs.readFile(file))
    )

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
        }
      }
    }
  }
  else {
    for (const file of inputs) {
      console.log(path.basename(file))
    }
  }
}

main(argv._[0])
