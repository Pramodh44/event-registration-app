import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  mode: { type: String, required: true },
  description: String,
  totalSeats: { type: Number, required: true },
  registeredCount: { type: Number, default: 0 },
});

export default mongoose.models.Event || mongoose.model("Event", EventSchema);
