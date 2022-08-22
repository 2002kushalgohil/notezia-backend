const cloudinary = require("cloudinary");

exports.imageUploader = async (req, options) => {
  const imagesArray = [];
  if (Array.isArray(req.files.photos)) {
    for (let i = 0; i < req.files.photos.length; i++) {
      const response = await cloudinary.v2.uploader.upload(
        req.files.photos[i].tempFilePath,
        options
      );
      imagesArray.push({
        id: response.public_id,
        secure_url: response.secure_url,
      });
    }
  } else {
    const response = await cloudinary.v2.uploader.upload(
      req.files.photos.tempFilePath,
      options
    );
    imagesArray.push({
      id: response.public_id,
      secure_url: response.secure_url,
    });
  }
  return imagesArray;
};

exports.imageDestroyer = async (imageId) => {
  await cloudinary.v2.uploader.destroy(imageId);
};
