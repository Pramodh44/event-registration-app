import mongoose from "mongoose";
import { getModel } from "../lib/mongodb";

const AnalyticsSchema = new mongoose.Schema({
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  payload: { type: mongoose.Schema.Types.Mixed, default: {} },
  userAgent: String,
  ip: String,
});

export default getModel("Analytics", AnalyticsSchema);
