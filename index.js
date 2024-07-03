import chalk from "chalk"
import exists from "elliotisms/lib/exists.js"
import returnSafeFilePath from "elliotisms/lib/return-safe-filePath.js"
import truncateFilename from "elliotisms/lib/truncate-filename.js"
import fs from "node:fs/promises"
import path from "node:path"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

import config from "./config.js"
import { ask } from "./lib/ask.js"
import { validateAndFormatInput } from "./lib/file-path-argument.js"
import filterInputs from "./lib/filters.js"
import getContent from "./lib/get-content.js"

const main = async (input, dryrun = false) => {
    if (!input) {
        throw new Error("No input files selected")
    }

    const inputs = await validateAndFormatInput(input)
    if (input.length === 0) {
        throw new Error("no valid inputs")
    }
    const initialLength = inputs.length

    const filteredInputs = await filterInputs(inputs)

    const finalLength = filteredInputs.length
    const filteredAmount = initialLength - filteredInputs.length
    filteredAmount > 0 &&
        console.log(`Filtered ${filteredAmount} non-img files for a total of ${finalLength} files.`)

    if (dryrun) {
        console.log("Querying API for new names...")
    } else {
        if (finalLength === 0) {
            console.log("No files to rename.")
            return
        }
        console.log("Renaming files...")
    }
    let index = 0

    for await (const file of filteredInputs) {
        try {
            const content = await getContent(file)

            const { filename, time } = await ask(content, file)

            const newFilename = path.join(path.dirname(file), `${filename}${path.extname(file)}`)
            const finalFilename = await returnSafeFilePath(newFilename)
            if (await exists(finalFilename)) {
                //normally wouldn't happen, but just to be safe.
                console.warn(
                    chalk.red(
                        `File ${finalFilename} already exists, and we screwed up renaming it, skipping`
                    )
                )
            } else {
                //simply rename
                !dryrun && (await fs.rename(file, finalFilename))

                console.log(
                    chalk.green(
                        `${dryrun === true ? "This would rename " : "Renamed "}${truncateFilename(path.basename(file))} to ${path.basename(finalFilename)} (${time})`
                    )
                )
            }
        } catch (error) {
            console.error(chalk.red(`${error.toString()}`))
        }
    }
}

yargs(hideBin(process.argv))
    .scriptName("dscimg")
    .usage("$0 <cmd> [args]")
    .command(
        "$0 <path>",
        "Default command with path of images to process",
        (yargs) => {
            yargs
                .positional("path", {
                    demandOption: true,
                    describe: "Path to process",
                    type: "string",
                })
                .option("dryrun", {
                    default: false,
                    describe: "Run the command in dry run mode",
                    type: "boolean",
                })
        },
        async (argv) => {
            await main(argv.path, argv.dryrun)
        }
    )
    .command(
        "config",
        "Run the configuration command",
        (yargs) => {
            // Configure options specific to the config command here, if any
        },
        async () => {
            console.log("Running config command...")
            await config.askAll()
        }
    )
    .help("h")
    .alias("h", "help")
    .alias("v", "version").argv
