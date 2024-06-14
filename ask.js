import slugify from "elliotisms/lib/slugify.js"
import { performance } from "node:perf_hooks"
export const ask = async (blob, filename) => {
  try {
    const requestOptions = {
      body: JSON.stringify({
        image: [...new Uint8Array(blob)],
        max_tokens: 512,
        prompt:
          "Describe this image in under 100 characters, the less, the better. Sentence fragments are okay. Do not include the word 'image'."
      }),
      headers: {
        Authorization: `Bearer ${process.env.CF_AI_TOKEN}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      redirect: "follow"
    }
    const startTime = performance.now()
    let response = await fetch(
      "https://gateway.ai.cloudflare.com/v1/e8308a9ca45585112db0d6f88a2cf0c9/penus/workers-ai/@cf/llava-hf/llava-1.5-7b-hf",
      requestOptions
    )
    const endTime = performance.now()
    process.env.DEBUG_ON &&
      console.log(`Took ${endTime - startTime} milliseconds`)

    let text = await response.json()

    if (text.success === false) {
      console.log("error with response", text)
      throw new Error(JSON.stringify(text.errors, null, 2))
    }
    let content = text.result.description

    return slugify(content)
  } catch (error) {
    console.log(`error with ask: ${error.toString()}`)
    return null;
  }
}
