const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

async function uploadStream(buffer, imageId) {
    return new Promise((res, rej) => {
        const image = cloudinary.uploader.upload_stream(
            { 
                folder: 'uploads',
                public_id: imageId,
                overwrite: true 
            },
            (error, result) => {
              if (error) return rej(error);
              res(result.secure_url);
            }
          );

        streamifier.createReadStream(buffer).pipe(image);
    })
}

module.exports = { uploadStream }