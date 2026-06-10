import mongoose from 'mongoose';

const lecturerDetailSchema = new mongoose.Schema(
  { name: { type: String, required: true }, affiliation: String },
  { _id: false }
);

const dateTimeSchema = new mongoose.Schema(
  { start: Date, end: Date, schedule: String },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  { name: String, email: String, phone: String, role: String },
  { _id: false }
);

const lectureSeriesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    lecturer_details: [lecturerDetailSchema],
    date_time: dateTimeSchema,
    mode: { type: String, enum: ['online', 'offline'], required: true },
    no_of_classes: { type: Number, min: 1 },
    thumbnail: String,
    reg_form_link: String,
    to_contact: [contactSchema],
    suppliments: [mongoose.Schema.Types.Mixed],
  },
  { timestamps: true }
);

export default mongoose.models.LectureSeries ??
  mongoose.model('LectureSeries', lectureSeriesSchema);
