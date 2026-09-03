import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },

    // All of these are legitimately absent for many real members —
    // never require them, and never assume a truthy check is enough
    // (e.g. some legacy records carry a placeholder LinkedIn URL).
    email:        { type: String, trim: true },
    linkedin_url: { type: String, trim: true },
    department:   { type: String, trim: true },
    bio:          { type: String },
    photo:        { type: String }, // Cloudinary URL

    active: { type: Boolean, default: true },

    // Explicit display order (lower = earlier). Falls back to
    // createdAt when unset so newly migrated docs still sort sanely.
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.TeamMember ??
  mongoose.model('TeamMember', teamMemberSchema);
