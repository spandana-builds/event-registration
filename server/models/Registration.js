const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  college: {
    type: String,
    required: true
  },
  event: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 🔐 Prevent duplicate registrations per event
registrationSchema.index({ event: 1, email: 1 }, { unique: true });
registrationSchema.index({ event: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
