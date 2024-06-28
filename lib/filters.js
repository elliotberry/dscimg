import { isNotJunk } from "junk"
import path from "node:path"

const imageFileTypes = new Set(["jpg", "jpeg", "png", "webp", "gif"])

const filters = (inputs) => {
    inputs = inputs.map((file) => path.resolve(file))
    inputs = inputs.filter((file) => {
        const extension = path.extname(file).slice(1)

        return imageFileTypes.has(extension)
    })
    return inputs.filter(isNotJunk)
}

export default filters
