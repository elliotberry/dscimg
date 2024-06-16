import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const extensionToMime = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".avif", "image/avif"],
  [".bmp", "image/bmp"],
  [".tiff", "image/tiff"],
  [".ico", "image/x-icon"]
])

const getBuffersize = async (buffer) => {
  const sizeInBytes = buffer.length
  const sizeInMB = sizeInBytes / (1024 * 1024)

  return sizeInMB
}
async function main(inputFilePath) {
  const targetSizeInBytes = 1 * 1024 * 1024 // 1MB in bytes

  try {
    let extension = path.extname(inputFilePath)

    let imageBuffer = await fs.readFile(inputFilePath)
 
    const originalFileSize = Buffer.byteLength(imageBuffer)
    const scalingFactor = Math.sqrt(targetSizeInBytes / originalFileSize)

    // Resize the image
    let ogWidth = await sharp(imageBuffer).metadata()

    let newWidth = Math.floor(ogWidth.width * scalingFactor)
    const resizedBuffer = await sharp(imageBuffer)
      .resize({ width: newWidth })
      .flatten({ background: "#FFFFFF" })
      .toFormat("jpeg")
      .toBuffer()   
    return resizedBuffer
  } catch (error) {
    console.error("Error processing image:", error)
  }
}

export default main
