const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  aid: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  pinCode: { type: String, required: true },
  guidelines: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;