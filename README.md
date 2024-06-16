# dscimg

> CLI program that uses takes in image filepaths, and uses Cloudflare Workers AI to rename them to a natural-language description.

![](./logo.png)
## Installation
Requires two environment variables:

* `CF_API_TOKEN` - Your [Cloudflare API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) with cf workers ai enabled in scope.
* `CF_ENDPOINT` - A cloudflare [AI Gateway](https://developers.cloudflare.com/ai-gateway/) URL for the [correct image-to-text model](https://developers.cloudflare.com/workers-ai/models/#image-to-text); this model being either `llava-hf/llava-1.5-7b-hf` or `uform-gen2-qwen-500m` as of June '24. This endpoint should look something like this: `https://gateway.ai.cloudflare.com/v1/<some secret shit>/<more secret shit>/workers-ai/@cf/llava-hf/llava-1.5-7b-hf`.

## Usage
```sh
dscimg "/home/dad/Pictures/unknown-pictures"
```
Takes in folders, files, and probably globs. Filters out the non-images. Will (probably) not overwrite your files.

## Money, money, money
[Cloudflare Workers does its pricing in "Neurons" to make it more of a pain in the ass to understand. ](https://developers.cloudflare.com/workers-ai/platform/pricing)My back-of-the-napkin math indicates that each request to `llava-hf/llava-1.5-7b-hf` is about .32 neurons. So, in theory, you get 31,250 requests per day. Cool.