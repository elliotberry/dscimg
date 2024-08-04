import { promises as fs } from "node:fs"
import { join } from "node:path"

async function getAllFiles(dir, listDirectories = false) {
    let results = []
    const list = await fs.readdir(dir, { withFileTypes: true })

    for await (const file of list) {
        const filePath = join(dir, file.name)
        if (file.isDirectory()) {
            results = [...results, ...(await getAllFiles(filePath, listDirectories))]
            if (listDirectories) {
                results.push(filePath)
            }
        } else {
            results.push(filePath)
        }
    }

    return results
}
export default getAllFiles
