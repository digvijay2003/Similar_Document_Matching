const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    fileName: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    data: {
      type: String,
    },
    path: {
      type: String,
      required: true,
    }
  });
  
const Document = mongoose.model('Document', documentSchema);
  
module.exports = Document;