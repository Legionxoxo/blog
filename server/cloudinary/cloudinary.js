const cloudinary = require('cloudinary')
          
cloudinary.config({ 
  cloud_name: 'diu4lrnfr', 
  api_key: '457147675998176', 
  api_secret: '35lktV1dBhnl4p_Nbg2DQ7g2q1c' 
});

uploadToCloudinary = (path, folder) => {
    return cloudinary.v2.uploader.upload(path, {
        folder
    }).then((data) => {
        return { url: data.url, public_id: data.public_id };
    }).catch((error) => {
        console.log(error)
    })
}

removeFromCloudinary = async (public_id) => {
    await cloudinary.v2.uploader.destroy(public_id, function (error, result) {
        console.log(result, error)
    })
}

module.exports = { uploadToCloudinary, removeFromCloudinary }