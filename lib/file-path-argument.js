import fs from "node:fs"
import path from "node:path"

import useFdir from "./use-fdir.js"
export const truncatePathIfPossible = (string_, parentDirectory) => {
    if (parentDirectory) {
        const truncated = string_.split(parentDirectory)[1]
        if (truncated) {
            return `...${truncated}`
        }
    }
    return string_
}

function isStringAGlobPattern(inputString) {
    const globPatternRegex = /\*/
    return globPatternRegex.test(inputString)
}

export const replaceAll = (string_, find, replace) => {
    return string_.split(find).join(replace)
}

//what is that character called??
export const replaceSquiglyWithHome = (string_) => {
    if (string_.includes("~")) {
        return replaceAll(string_, "~", process.env.HOME)
    }
    return string_
}

const getStats = async (inputString) => {
    try {
        const stats = await fs.promises.stat(inputString)

        return [stats.isDirectory(), stats.isFile()]
    } catch {
        return [false, false]
    }
}

const getFilePathType = async (inputString) => {
    let [isDirectory, isFile] = await getStats(inputString)
    if (isDirectory) {
        return "directory"
    } else if (isFile) {
        return "file"
    } else {
        const glob = isStringAGlobPattern(inputString)
        return glob ? "glob" : "invalid"
    }
}

const handleArray = async (inputString) => {
    try {
        const filesArray = []
        for await (const file of inputString) {
            const abs = path.resolve(file)
            if (allowDirectories === false) {
                let [, isFile] = await getStats(abs)
                if (isFile) {
                    filesArray.push(abs)
                }
            } else {
                filesArray.push(abs)
            }
        }
        return filesArray
    } catch (error) {
        throw new Error(`error getting array of files from input: ${error}`)
    }
}

var type

//I realize this is convoluted, ah shit damn
//verify CLI input is valid
export const validateAndFormatInput = async (inputString, allowDirectories = false) => {
    if (!inputString) {
        console.error("No input file provided.")
        return
    }
    try {
        //zsh seems to be giving the first argument,...
        //when i put in a glob, as a file array, so, here goes nothing

        if (Array.isArray(inputString)) {
            return await handleArray()
        }
        const type = await getFilePathType(inputString)

        switch (type) {
            case "directory": {
                return await useFdir(inputString, -1, false, false)
            }
            case "file": {
                return [path.resolve(inputString)]
            }
            case "glob": {
                return await useFdir(inputString, -1, false, true)
            }
            default: {
                throw new Error(`invalid input: ${inputString}`)
            }
        }
    } catch (error) {
        throw new Error(`invalid input: ${inputString}. ${error} file path type: ${type}`)
    }
}
