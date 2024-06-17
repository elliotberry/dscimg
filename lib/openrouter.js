import "dotenv/config"
import { performance } from "node:perf_hooks"
import fs from "node:fs/promises"

const mimetypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
}

const addMIMEToBase64 = (b64, ext) => {
    return `data:${mimetypes[ext]};base64,${b64}`
}
/*

fireworks/firellava-13b: 1291 - 1600ms
google/gemini-flash-1.5: 1300 - 2100ms
openai/gpt-4-vision-preview: 2500 - 3200ms
nousresearch/nous-hermes-2-vision-7b
google/gemini-pro-vision: 3700 - 4900ms
google/gemini-pro-vision

openai/gpt-4o: 2700 - 4000ms
liuhaotian/llava-yi-34b: 1100 - 1300ms
liuhaotian/llava-13b
*/
const openrouter = async (b64) => {
    let key = process.env.OPENROUTER_API_KEY
    let system = "You are an expert art critic. The user will send you an image. Describe it for them."
   
    let res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        body: JSON.stringify({
           // max_tokens: 4096,
            model: "liuhaotian/llava-13b",
            messages: [
                {
                    content: system,
                    role: "system",
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Describe this image using a sentence fragment under 150 characters. Do not use articles, prepositions, conjunctions, pronouns, adverbs, filler words, possessives, redundancies, subjective descriptors, or the word 'image' unless necessary to convey meaning. Reply with as much uniqueness as possible to compare this photo against others.",
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: b64
                             },
                        },
                    ],
                },
            ],
        }),
        headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
        },
        method: "POST",
    })
    
    let data = await res.json()

    if (!data.choices) {
        throw new Error("no choices, this is the response: " + JSON.stringify(data))
    }
    let content = data.choices[0].message.content
    return content
}

const test = async () => {
    let b64 = await fs.readFile("/Users/eberry/projects/describe-image/test.jpg", "base64")
    b64 = addMIMEToBase64(b64, ".jpg")
    const startTime = performance.now()
    let content = await openrouter(b64)
    const endTime = performance.now()
    console.log(`${Math.floor(endTime - startTime)}ms`)
    console.log(content)
}

test()
