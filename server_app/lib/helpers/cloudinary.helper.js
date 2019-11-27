((cloudinaryHelper) => {
  'use strict';

  const path = require('path');

  cloudinaryHelper.singleImageUpload = (cloudinary, req, file, uploadInProgress, res, next) => {
    cloudinary.uploader.upload(
      file.path,
      (err, result) => {
        if(err){
          return console.log('error', err);
        }
      },
      {
        public_id: path.basename(file.path, path.extname(file.filename)),
        format: (path.extname(file.filename)).substring(1),
        // format: req.app.get('cloudinaryextension'),
        quality: 60
      }
    );
    if(!uploadInProgress) {
      next();
    }
  };


  cloudinaryHelper.deleteImage = (fileName, cloudinary, req, res, next) => {
    cloudinary.uploader.destroy(
      path.basename(fileName, path.extname(fileName)),
      (err, result) => {
      },
      {
        invalidate: true
      });
  };

})(module.exports);
