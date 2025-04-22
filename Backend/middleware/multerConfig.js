
const multer = require('multer');
const path = require('path');

const createStorage = (folder) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, folder),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

module.exports = {
  uploadUserPic: multer({ storage: createStorage('userpic/') }),
  uploadMissingChild: multer({ storage: createStorage('reported/') }),
  uploadLostChild: multer({ storage: createStorage('missing/') }),
};
