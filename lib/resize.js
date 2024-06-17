import fs from "node:fs/promises"
import sharp from "sharp"


async function main(inputFilePath) {
  const targetSizeInBytes = 1 * 1024 * 1024 // 1MB in bytes

  try {

    const imageBuffer = await fs.readFile(inputFilePath)
 
    const originalFileSize = Buffer.byteLength(imageBuffer)
    const scalingFactor = Math.sqrt(targetSizeInBytes / originalFileSize)

    // Resize the image
    const ogWidth = await sharp(imageBuffer).metadata()

    const newWidth = Math.floor(ogWidth.width * scalingFactor)
    return await sharp(imageBuffer)
    .resize({ width: newWidth })
    .flatten({ background: "#FFFFFF" })
    .toFormat("jpeg")
    .toBuffer()
  } catch (error) {
    console.error("Error processing image:", error)
  }
}

export default main
