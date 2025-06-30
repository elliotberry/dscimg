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
export default async (blob, filename) => {
    const { cloudflareAIToken, cloudflareEndpoint } = await config.valuesOrPrompts()
    // const prompt = "Describe this image using a sentence fragment under 150 characters. Do not use articles, prepositions, conjunctions, pronouns, adverbs, filler words, possessives, redundancies, subjective descriptors, or the word 'image' unless necessary to convey meaning. Reply with as much uniqueness as possible to compare this photo against others."
  //  const prompt =
  //      "Review this image and determine to the best of your ability the type of image it is (options are: graphic, photo, or illustration); what or who is the subject of the image; and what is happening in the image. Respond with a sentence fragment in the format of '[type of image]-[subject]-[action].' If the image has text in it, always add \"-[TEXT]\" to the end of the response. If the image is abstract or unclear, respond to the best of your ability."
  const prompt = "Describe this image using a sentence fragment under 150 characters. Do not use articles, prepositions, conjunctions, pronouns, adverbs, filler words, possessives, redundancies, subjective descriptors, or the word 'image' unless necessary to convey meaning. Reply with as much uniqueness as possible to compare this photo against others."
  const requestOptions = {
        body: JSON.stringify({
            image: [...new Uint8Array(blob)],
            max_tokens: 512,
            prompt: prompt,
        }),
        headers: {
            Authorization: `Bearer ${cloudflareAIToken}`,
            "Content-Type": "application/json",
        },
        method: "POST"
    }
    const startTime = performance.now()
    const response = await fetch("https://gateway.ai.cloudflare.com/v1/e8308a9ca45585112db0d6f88a2cf0c9/penus/workers-ai/@cf/microsoft/resnet-50", requestOptions)
    const endTime = performance.now()

    const text = await response.json()

   return text
}
