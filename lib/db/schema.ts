import "server-only";

import mongoose, { type Model, Schema } from "mongoose";

export type User = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Chat = {
  id: string;
  createdAt: Date;
  title: string;
  userId: string;
  visibility: "public" | "private";
};

export type DBMessage = {
  id: string;
  chatId: string;
  role: string;
  parts: unknown;
  attachments: unknown;
  createdAt: Date;
};

export type Vote = {
  chatId: string;
  messageId: string;
  isUpvoted: boolean;
};

export type Document = {
  id: string;
  createdAt: Date;
  title: string;
  content: string | null;
  kind: "text" | "code" | "image" | "sheet";
  userId: string;
};

export type Suggestion = {
  id: string;
  documentId: string;
  documentCreatedAt: Date;
  originalText: string;
  suggestedText: string;
  description: string | null;
  isResolved: boolean;
  userId: string;
  createdAt: Date;
};

const userSchema = new Schema(
  {
    _id: { type: String },
    email: { type: String, required: true },
    name: { type: String, default: null },
    image: { type: String, default: null },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

const chatSchema = new Schema({
  _id: { type: String },
  createdAt: { type: Date, required: true },
  title: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  visibility: { type: String, enum: ["public", "private"], default: "private" },
});

const messageSchema = new Schema({
  _id: { type: String },
  chatId: { type: String, required: true, index: true },
  role: { type: String, required: true },
  parts: { type: Schema.Types.Mixed, required: true },
  attachments: { type: Schema.Types.Mixed, required: true, default: [] },
  createdAt: { type: Date, required: true },
});

const voteSchema = new Schema({
  chatId: { type: String, required: true },
  messageId: { type: String, required: true },
  isUpvoted: { type: Boolean, required: true },
});
voteSchema.index({ chatId: 1, messageId: 1 }, { unique: true });

// Documents support multiple versions: same logical `id`, different `createdAt`.
// MongoDB _id is auto-generated per version; `id` is the logical document UUID.
const documentSchema = new Schema({
  id: { type: String, required: true, index: true },
  createdAt: { type: Date, required: true },
  title: { type: String, required: true },
  content: { type: String, default: null },
  kind: {
    type: String,
    enum: ["text", "code", "image", "sheet"],
    default: "text",
  },
  userId: { type: String, required: true },
});

const suggestionSchema = new Schema({
  _id: { type: String },
  documentId: { type: String, required: true, index: true },
  documentCreatedAt: { type: Date, required: true },
  originalText: { type: String, required: true },
  suggestedText: { type: String, required: true },
  description: { type: String, default: null },
  isResolved: { type: Boolean, required: true, default: false },
  userId: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

export const UserModel: Model<any> =
  mongoose.models.User ?? mongoose.model("User", userSchema);

export const ChatModel: Model<any> =
  mongoose.models.Chat ?? mongoose.model("Chat", chatSchema);

export const MessageModel: Model<any> =
  mongoose.models.Message_v2 ?? mongoose.model("Message_v2", messageSchema);

export const VoteModel: Model<any> =
  mongoose.models.Vote_v2 ?? mongoose.model("Vote_v2", voteSchema);

export const DocumentModel: Model<any> =
  mongoose.models.Document ?? mongoose.model("Document", documentSchema);

export const SuggestionModel: Model<any> =
  mongoose.models.Suggestion ?? mongoose.model("Suggestion", suggestionSchema);
