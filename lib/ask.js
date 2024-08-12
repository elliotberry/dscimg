import slugify from "elliotisms/slugify"
import { performance } from "node:perf_hooks"

import config from "../config.js"
String.prototype.removePrefix = function () {
    try {
        if (this.startsWith("a-")) {
            return this.slice(2)
        }
        return this
    } catch {
        return this
    }
}
export const ask = async (blob, filename) => {
    const { cloudflareAIToken, cloudflareEndpoint } = await config.valuesOrPrompts()

    const requestOptions = {
        body: JSON.stringify({
            image: [...new Uint8Array(blob)],
            max_tokens: 512,
            prompt: "Describe this image using a sentence fragment under 150 characters. Do not use articles, prepositions, conjunctions, pronouns, adverbs, filler words, possessives, redundancies, subjective descriptors, or the word 'image' unless necessary to convey meaning. Reply with as much uniqueness as possible to compare this photo against others.",
        }),
        headers: {
            Authorization: `Bearer ${cloudflareAIToken}`,
            "Content-Type": "application/json",
        },
        method: "POST",
        redirect: "follow",
    }
    const startTime = performance.now()
    const response = await fetch(cloudflareEndpoint, requestOptions)
    const endTime = performance.now()

    const text = await response.json()

    if (text.success === false) {
        const textError = text.errors.map((error) => `${error.code}: ${error.message}`).join("\n")
        throw new Error(`${filename}: ${textError}`)
    }
    const content = text.result.description

    const slugged = slugify(content)

    return { filename: slugged.removePrefix(), time: `${Math.floor(endTime - startTime)}ms` }
}
