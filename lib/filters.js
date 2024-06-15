import { stat } from "node:fs/promises"
import path from "node:path"
import {isNotJunk} from 'junk';
const imageFileTypes = new Set(["jpg", "jpeg", "png", "webp", "gif"])
const maxFileSize = 1_000_000

const filters = (inputs) => {
  inputs = inputs
    .filter(async (file) => {
      const stats = await stat(file)
      return stats.size < maxFileSize
    })
    .map((file) => path.resolve(file))
  inputs = inputs.filter((file) => {
    const ext = path.extname(file).slice(1)

    return imageFileTypes.has(ext)
  })
inputs = inputs.filter(isNotJunk)
  return inputs
}

export default filters
