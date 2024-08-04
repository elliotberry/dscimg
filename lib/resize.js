import fs from "node:fs/promises"
import sharp from "sharp"

async function main(inputFilePath) {
    const targetSizeInBytes = 1 * 1024 * 1024 // 1MB in bytes

    try {
        const imageBuffer = await fs.readFile(inputFilePath)

        const { size: originalFileSize, width } = await sharp(imageBuffer).metadata()
        const scalingFactor = Math.sqrt(targetSizeInBytes / originalFileSize)
        const newWidth = Math.floor(width * scalingFactor)

        return await sharp(imageBuffer)
            .resize({ width: newWidth })
            .flatten({ background: "#FFFFFF" })
            .jpeg()
            .toBuffer()
    } catch (error) {
        console.error("Error processing the image:", error)
        throw error
    }
}

export default main
