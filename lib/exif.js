import xattr from "@napi-rs/xattr"

async function addExifTags(tags, filePath) {
   

       for await (let [name, value] of Object.entries(tags)) {
        if (typeof value === "object") {
            value = JSON.stringify(value)
        }
        await xattr.setAttribute(filePath, name, value)
    }
 
}

export default addExifTags
