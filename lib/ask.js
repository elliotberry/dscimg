import path from "node:path"
import { performance } from "node:perf_hooks"

import slugify from "elliotisms/lib/slugify.js"
import truncateFilename from "elliotisms/lib/truncate-filename.js"

String.prototype.removePrefix = function () {
    try {
        if (this.startsWith("a-")) {
            return this.slice(2)
        }
        return this
    } catch (error) {
        return this
    }
}
export const ask = async (blob, filename) => {
    const requestOptions = {
        body: JSON.stringify({
            image: [...new Uint8Array(blob)],
            max_tokens: 512,
            prompt: "Describe this image in under 100 characters, the less, the better. Try to include the type of image it is; e.g, illustration, photo, etc. Sentence fragments are encouraged. Do not include the word 'image'.",
        }),
        headers: {
            Authorization: `Bearer ${process.env.CF_AI_TOKEN}`,
            "Content-Type": "application/json",
        },
        method: "POST",
        redirect: "follow",
    }
    const startTime = performance.now()
    const response = await fetch(process.env.CF_ENDPOINT, requestOptions)
    const endTime = performance.now()

    const text = await response.json()

    if (text.success === false) {
        console.log("error with response", text)
        throw new Error(JSON.stringify(text.errors, null, 2))
    }
    const content = text.result.description

    let slugged = slugify(content)

    return { filename: slugged.removePrefix(), time: `${Math.floor(endTime - startTime)}ms` }
}
