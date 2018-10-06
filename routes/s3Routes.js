const AWS = require('aws-sdk');
const uuid = require('uuid/v4');
const requireLogin = require('../middlewares/requireLogin');
const { s3AccessKeyId, s3Secret } = require('../config/keys');

const s3 = new AWS.S3({
  accessKeyId: s3AccessKeyId,
  secretAccessKey: s3Secret,
});
module.exports = (app) => {
  app.get('/api/upload', requireLogin, (req, res) => {
    const key = `${req.user.id}/${uuid()}.jpg`;
    s3.getSignedUrl('putObject', {
      Bucket: 'blog-bucket-onfqzmpgvr',
      ContentType: 'image/jpeg',
      Key: key,
    }, (err, url) => {
      res.send({ key, url });
    });
  });
};
