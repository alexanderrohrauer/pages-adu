import "server-only";

import mongoose, { type Model, Schema } from "mongoose";

export type Artifact = {
  id: string;
  name: string;
  technicalName: string;
  createdAt: Date;
};

export type ChangeRequest = {
  id: string;
  createdAt: Date;
  title: string;
  artifactId: string;
  path?: string;
};

export type PersistedMessage = {
  id: string;
  changeRequestId: string;
  parent_id: string | null;
  format: string;
  content: unknown;
  createdAt: Date;
};

const artifactSchema = new Schema({
  _id: { type: String },
  name: { type: String, required: true },
  technicalName: { type: String, required: true, unique: true },
  createdAt: { type: Date, required: true },
});

const changeRequestSchema = new Schema({
  _id: { type: String },
  createdAt: { type: Date, required: true },
  title: { type: String, required: true },
  artifactId: { type: String, required: true, index: true },
  path: { type: String },
});

const messageSchema = new Schema({
  _id: { type: String },
  changeRequestId: { type: String, required: true, index: true },
  parent_id: { type: String, default: null },
  format: { type: String, required: true },
  content: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, required: true },
});

export const ArtifactModel: Model<Artifact> =
  mongoose.models.Artifact ?? mongoose.model("Artifact", artifactSchema);

export const ChangeRequestModel: Model<ChangeRequest> =
  mongoose.models.ChangeRequest ??
  mongoose.model("ChangeRequest", changeRequestSchema);

export const MessageModel: Model<PersistedMessage> =
  mongoose.models.Message_v2 ?? mongoose.model("Message_v2", messageSchema);
