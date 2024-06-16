import { VertexAI } from '@google-cloud/vertexai';
import fs from 'fs/promises';
import path from 'path';

/**
 * Convert an image file to a Base64 string.
 * @param {string} filename - The path to the image file.
 * @returns {Promise<string>} - The Base64 string representation of the image.
 */
async function convertImageToBase64(filename) {
  try {
    const filePath = path.resolve(filename);
    const fileData = await fs.readFile(filePath);
    return fileData.toString('base64');
  } catch (error) {
    console.error('Error converting image to Base64:', error);
    throw error;
  }
}

/**
 * Create non-streaming multipart content.
 * @param {string} filename - The path to the image file.
 * @param {string} projectId - The Google Cloud project ID.
 * @param {string} model - The model to use for generation.
 * @param {string} mimeType - The MIME type of the image.
 */
async function createNonStreamingMultipartContent(
  filename,
  projectId = 'speech-text-2022',
  location = 'us-east1',
  model = 'gemini-1.5-flash-001',
  mimeType = 'image/jpeg'
) {
  // Initialize Vertex with your Cloud project and location
  const vertexAI = new VertexAI({ project: projectId, location: location });

  // Convert image file to Base64
  const base64Image = await convertImageToBase64(filename);

  // Instantiate the model
  const generativeVisionModel = vertexAI.getGenerativeModel({
    model: model,
  });

  // For images, the SDK supports both Google Cloud Storage URI and Base64 strings
  const filePart = {
    fileData: {
      fileContent: base64Image,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: 'What is shown in this image?',
  };

  const request = {
    contents: [{ role: 'user', parts: [filePart, textPart] }],
  };

  console.log('Prompt Text:');
  console.log(request.contents[0].parts[1].text);

  console.log('Non-Streaming Response Text:');
  // Create the response stream
  const responseStream = await generativeVisionModel.generateContentStream(request);

  // Wait for the response stream to complete
  const aggregatedResponse = await responseStream.response;

  // Select the text from the response
  const fullTextResponse = aggregatedResponse.candidates[0].content.parts[0].text;

  console.log(fullTextResponse);
}

// Example usage
const filename = './test.jpg'; // Update this with your image file path
createNonStreamingMultipartContent(filename);
