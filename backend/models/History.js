import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: 'Untitled Draft',
  }
}, { timestamps: true });

export default mongoose.model('History', historySchema);
