import tesseract from "node-tesseract-ocr";

const ocr = async (filepath) => {
    try {
        const config = {
            lang: "eng",
            oem: 1,
            psm: 3,
        }

        return await tesseract.recognize(filepath, config).then(text => text);
    } catch (error) {
        console.log(error)
    }
}
export default ocr
