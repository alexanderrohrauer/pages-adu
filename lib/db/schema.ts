import "server-only";

import mongoose, { type Model, Schema } from "mongoose";

export type ChangeRequest = {
  id: string;
  createdAt: Date;
  title: string;
  userId: string;
};

export type PersistedMessage = {
  id: string;
  changeRequestId: string;
  parent_id: string | null;
  format: string;
  content: unknown;
  createdAt: Date;
};

const changeRequestSchema = new Schema({
  _id: { type: String },
  createdAt: { type: Date, required: true },
  title: { type: String, required: true },
  userId: { type: String, required: true, index: true },
});

const messageSchema = new Schema({
  _id: { type: String },
  changeRequestId: { type: String, required: true, index: true },
  parent_id: { type: String, default: null },
  format: { type: String, required: true },
  content: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, required: true },
});

export const ChangeRequestModel: Model<ChangeRequest> =
  mongoose.models.ChangeRequest ??
  mongoose.model("ChangeRequest", changeRequestSchema);

export const MessageModel: Model<PersistedMessage> =
  mongoose.models.Message_v2 ?? mongoose.model("Message_v2", messageSchema);
