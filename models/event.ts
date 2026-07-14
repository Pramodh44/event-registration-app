import mongoose from "mongoose";
import { getModel } from "../lib/mongodb";

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  mode: { type: String, required: true },
  description: String,
  totalSeats: { type: Number, required: true },
  registeredCount: { type: Number, default: 0 },
});

export default getModel("Event", EventSchema);
