import mongoose from "mongoose";
import { getModel } from "../lib/mongodb";

const RegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: String,
  source: String,
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
});

RegistrationSchema.index({ email: 1, eventId: 1 }, { unique: true });

export default getModel("Registration", RegistrationSchema);
