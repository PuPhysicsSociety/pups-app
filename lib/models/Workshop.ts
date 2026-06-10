import mongoose from 'mongoose';

const lecturerDetailSchema = new mongoose.Schema(
  { name: { type: String, required: true }, affiliation: String, image: String },
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

const subeventSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    date_time: dateTimeSchema,
    speaker: String,
  },
  { _id: false }
);

const workshopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    lecturer_details: [lecturerDetailSchema],
    date_time: dateTimeSchema,
    mode: { type: String, enum: ['online', 'offline'], required: true },
    reg_form_link: String,
    to_contact: [contactSchema],
    suppliments: [mongoose.Schema.Types.Mixed],
    past_images_preview: [String],
    drive_link: String,
    subevent: [subeventSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Workshop ??
  mongoose.model('Workshop', workshopSchema);
