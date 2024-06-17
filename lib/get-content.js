import {readFile,stat} from "node:fs/promises"

import resize from "./resize.js"

const maxFileSize = 1_000_000
const getContent = async (file) => {
  const stats = await stat(file)
  return stats.size >= maxFileSize ? await resize(file) : await readFile(file);
}

export default getContent
