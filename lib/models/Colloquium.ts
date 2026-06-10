import mongoose from 'mongoose';

const colloquiumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    speaker: {
      name: { type: String, required: true },
      affiliation: String,
    },
    abstract: String,
    time: Date,
    venue: String,
    ytLink: String,
    poster: String,
    reg_form_link: String,
  },
  { timestamps: true }
);

export default mongoose.models.Colloquium ??
  mongoose.model('Colloquium', colloquiumSchema);
