const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 8 },
  email: { type: String, required: true, unique: true, match: /^\S+@\S+\.\S+$/ },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['organizer', 'customer'], required: true },
  age: { type: Number, min: 16, max: 100 },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  profilePictureURL: { type: String, match: /\.(jpg|jpeg|png)$/ },
  country: { type: String, default: 'Egypt' },
  city: { type: String }
});

// Encrypt password before saving user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);
