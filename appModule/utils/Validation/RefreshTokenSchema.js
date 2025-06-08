import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true, // Optional, prevents duplicate tokens
  },
  fingerprint: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '1d' } // Automatically deletes the token after expiration
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema)

export default RefreshToken;
