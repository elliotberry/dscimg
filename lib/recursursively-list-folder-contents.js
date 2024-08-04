import { promises as fs } from "node:fs"
import { join } from "node:path"

async function getAllFiles(dir) {
    let results = []
    const list = await fs.readdir(dir, { withFileTypes: true })

    for (const file of list) {
        const filePath = join(dir, file.name)
        if (file.isDirectory()) {
            results = results.concat(await getAllFiles(filePath))
        } else {
            results.push(filePath)
        }
    }

    return results
}
export default getAllFiles
