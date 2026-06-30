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
  role: string;
  parts: unknown;
  attachments: unknown;
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
  role: { type: String, required: true },
  parts: { type: Schema.Types.Mixed, required: true },
  attachments: { type: Schema.Types.Mixed, required: true, default: [] },
  createdAt: { type: Date, required: true },
});

export const ChangeRequestModel: Model<ChangeRequest> =
  mongoose.models.ChangeRequest ??
  mongoose.model("ChangeRequest", changeRequestSchema);

export const MessageModel: Model<PersistedMessage> =
  mongoose.models.Message_v2 ?? mongoose.model("Message", messageSchema);
