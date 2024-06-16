import fs from 'node:fs/promises';

import sharp from 'sharp';

async function main(inputFilePath) {
  
  const targetSizeInBytes = 1 * 1024 * 1024; // 1MB in bytes

  try {
    // Read the image file
    let imageBuffer = await fs.readFile(inputFilePath);
    const originalFileSize = Buffer.byteLength(imageBuffer);

    if (originalFileSize <= targetSizeInBytes) {
      console.log('Image is already under 1MB');
      return new Blob([imageBuffer], { type: 'image/jpeg' });
    }

    // Estimate the scaling factor
    const scalingFactor = Math.sqrt(targetSizeInBytes / originalFileSize);

    // Resize the image
    const resizedBuffer = await sharp(imageBuffer)
      .resize({ width: Math.floor((await sharp(imageBuffer).metadata()).width * scalingFactor) })
      .toBuffer();

    const outputBlob = new Blob([resizedBuffer], { type: 'image/jpeg' });
    console.log('Resized image to be under 1MB');

    return outputBlob;
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

export default main;
