import chalk from "chalk"
import "dotenv/config"
import exists from "elliotisms/lib/exists.js"
import returnSafeFilePath from "elliotisms/lib/return-safe-filePath.js"
import truncateFilename from "elliotisms/lib/truncate-filename.js"
import fs from "node:fs/promises"
import path from "node:path"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

import { ask } from "./lib/ask.js"
import { validateAndFormatInput } from "./lib/file-path-argument.js"
import filterInputs from "./lib/filters.js"
import getContent from "./lib/get-content.js"

const argv = yargs(hideBin(process.argv))

  .option("dryrun", {
    alias: "d",
    default: false,
    description: "Dry run: get new filenames, but don't rename files",
    type: "boolean"
  })
  .help().argv

const main = async (input) => {
  if (!process.env.CF_ENDPOINT || !process.env.CF_AI_TOKEN) {
    console.error("Please set the CF_ENDPOINT and CF_AI_TOKEN environment variables.")
    process.exit(1)
  }


  const inputs = await validateAndFormatInput(input)

  const initialLength = inputs.length

  const filteredInputs = await filterInputs(inputs)

  const finalLength = filteredInputs.length
  const filteredAmount = initialLength - filteredInputs.length
  filteredAmount > 0 && console.log(`Filtered ${filteredAmount} non-img files for a total of ${finalLength} files.`)
  
  if (argv.dryrun) {
    console.log("Querying API for new names...");
  } else {
    console.log("Renaming files...");
  }
  let index = 0

  for await (const file of filteredInputs) {
    try {
      const content = await getContent(file)

      const { filename, time } = await ask(content, file)

      const newFilename = path.join(path.dirname(file), `${filename}${path.extname(file)}`)
      const finalFilename = await returnSafeFilePath(newFilename)
      if (await exists(finalFilename)) {
        console.warn(chalk.red(`File ${finalFilename} already exists, and we screwed up renaming it, skipping`))
      } else {
        !argv.dryrun && await fs.rename(file, finalFilename)
        console.log(
          chalk.green(`${argv.dryrun ? "This would rename " : "Renamed "}${truncateFilename(path.basename(file))} to ${path.basename(finalFilename)} (${time})`)
        )
      }
    } catch (error) {
      console.error(chalk.red(`Error processing file: ${error.toString()}`))
    }
    index++
  }
}

main(argv._[0])
