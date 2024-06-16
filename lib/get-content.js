import resize from "./resize.js"
import {stat, readFile} from "node:fs/promises"

const maxFileSize = 1_000_000
const getContent = async (file) => {
  const stats = await stat(file)
  if (stats.size >= maxFileSize) {
    let content = await resize(file)
    return content
  } else {
    let content = await readFile(file)
    return content
  }
}

export default getContent
