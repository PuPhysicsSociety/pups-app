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

const supplementSchema = new mongoose.Schema(
  { url: { type: String, required: true }, name: String, type: String, source: String },
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

const eventSchema = new mongoose.Schema(
  {
    // Differentiates lecture_series | workshop | conference
    type: {
      type: String,
      enum: ['lecture_series', 'workshop', 'conference'],
      required: true,
      default: 'lecture_series',
    },

    title:       { type: String, required: true },
    description: String,
    mode:        { type: String, enum: ['online', 'offline'], required: true, default: 'offline' },

    // Speakers / facilitators / presenters
    lecturer_details: [lecturerDetailSchema],

    date_time:    dateTimeSchema,
    thumbnail:    String,   // Cloudinary URL

    reg_form_link: String,
    to_contact:    [contactSchema],

    // Files / PDFs / Drive links
    suppliments: [supplementSchema],

    // Photo gallery → carousel on detail page
    past_images_preview: [String],   // Cloudinary URLs

    // Google Drive folder or embed
    drive_link: String,

    // Lecture-series specific
    no_of_classes: { type: Number, min: 1 },

    // Workshop specific
    subevent: [subeventSchema],

    // Conference / general specific
    venue:    String,
    audience: String,
    duration: String,
    tags:     [String],
  },
  { timestamps: true }
);

export default mongoose.models.Event ?? mongoose.model('Event', eventSchema);
