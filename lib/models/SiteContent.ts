import mongoose from 'mongoose';

/**
 * One document per editable public page. `data` is intentionally loose
 * (Mixed) rather than one rigid schema per page — Home, About, and Contact
 * each have a different shape, and this avoids three near-duplicate
 * schemas that all need migrating in lockstep whenever a field is added.
 * Structure is enforced at the API layer / admin form instead.
 */
const siteContentSchema = new mongoose.Schema(
  {
    page: { type: String, required: true, unique: true, enum: ['home', 'about', 'contact'] },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    // Unpublished changes, saved separately so half-finished edits never
    // show up on the live site until explicitly published.
    draft: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.SiteContent ??
  mongoose.model('SiteContent', siteContentSchema);
