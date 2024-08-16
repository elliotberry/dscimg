import chalk from "chalk"
import exists from "elliotisms/exists"
import returnSafeFilePath from "elliotisms/return-safe-filepath"
import truncateFilename from "elliotisms/truncate-filename"
import fs from "node:fs/promises"
import path from "node:path"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import addExifTags from "./lib/exif.js"
import config from "./config.js"
import { ask } from "./lib/ask.js"
import { validateAndFormatInput } from "./lib/file-path-argument.js"
import filterInputs from "./lib/filters.js"
import getContent from "./lib/get-content.js"
import ocr from "./lib/tesseract.js"

const main = async (input, dryrun = false, useXMP = true, useOCR = true) => {
    if (!input) {
        throw new Error("No input files selected")
    }

    const inputs = await validateAndFormatInput(input)
    if (inputs.length === 0) {
        throw new Error("No valid inputs")
    }
    const initialLength = inputs.length

    const filteredInputs = await filterInputs(inputs)

    const finalLength = filteredInputs.length
    const filteredAmount = initialLength - finalLength
    if (filteredAmount > 0) {
        console.log(`Filtered ${filteredAmount} non-img files for a total of ${finalLength} files.`)
    }

    if (dryrun) {
        console.log("Querying API for new names...")
    } else {
        if (finalLength === 0) {
            console.log("No files to rename.")
            return
        }
        console.log("Renaming files...")
    }

    for (const file of filteredInputs) {
        try {
            const content = await getContent(file)
            const { filename, time, prompt, result } = await ask(content, file)

            const newFilename = path.join(path.dirname(file), `${filename}${path.extname(file)}`)
            const finalFilename = await returnSafeFilePath(newFilename)

            if (await exists(finalFilename)) {
                console.warn(chalk.red(`File ${finalFilename} already exists, skipping`))
            } else {
                if (!dryrun) {
                    await fs.rename(file, finalFilename)
                }
                if (useXMP) {
                    let exifData = {
                        "DscImg_Prompt": prompt,
                        "DscImg_ContentDescription": result,
                        "DscImg_InferenceTime": time,
                        "DscImg_OriginalFilename": path.basename(file),
                    }
                    if (useOCR) {
                        let text = await ocr(finalFilename)
                        exifData["DscImg_Tesseract_OCR_Result"] = text
                    }

                    await addExifTags(exifData, finalFilename)
                }
                console.log(
                    chalk.green(
                        `${dryrun ? "This would rename" : "Renamed"} ${truncateFilename(path.basename(file))} to ${path.basename(finalFilename)} (${time})`
                    )
                )
            }
        } catch (error) {
            console.error(chalk.red(error.toString(), error.stack))
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
                .option("exif", {
                    alias: "e",
                    default: true,
                    describe: "Save debug info as XMP metadata",
                    type: "boolean",
                })
                .option("ocr", {
                    alias: "o",
                    default: true,
                    describe: "Run OCR on images and save result as XMP metadata",
                    type: "boolean",
                })
        },
        async (argv) => {
            await main(argv.path, argv.dryrun, argv.exif, argv.ocr)
        }
    )
    .command(
        "config",
        "Run the configuration command",
        () => {},
        async () => {
            console.log("Running config command...")
            await config.askAll()
        }
    )
    .help("h")
    .alias("h", "help")
    .alias("v", "version").argv
