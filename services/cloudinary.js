import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv'
import streamifier from 'streamifier'

dotenv.config();

// Validate required Cloudinary configuration
const requiredCloudinaryVars = ['CLOUD_NAME', 'API_KEY', 'API_SECRET'];
const missingCloudinaryVars = requiredCloudinaryVars.filter(v => !process.env[v]);
if (missingCloudinaryVars.length > 0) {
  console.warn(`Warning: Missing Cloudinary configuration variables: ${missingCloudinaryVars.join(', ')}`);
}

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

export function uploadToCloudinaryFromBuffer(buffer, folder = "my-profile") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export { cloudinary }