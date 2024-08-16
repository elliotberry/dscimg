import { ExifTool } from "exiftool-vendored"
import { promises as fs } from "fs"
import xattr from "@napi-rs/xattr"

async function addExifTags(tags, filePath) {
   
    const exiftool = new ExifTool({});
        // Add or modify EXIF tags
     //   await exiftool.write(filePath, {XPComment: "this is a test comment" })
       // await exiftool.end()
       for await (let [name, value] of Object.entries(tags)) {
        if (typeof value === "object") {
            value = JSON.stringify(value)
        }
        await xattr.setAttribute(filePath, name, value)
    }
 
}

export default addExifTags
