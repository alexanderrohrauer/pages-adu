import "server-only";

import type { ArtifactKind } from "@/components/chat/artifact";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import { ChatbotError } from "../errors";
import {
  ChatModel,
  DocumentModel,
  MessageModel,
  SuggestionModel,
  type Chat,
  type DBMessage,
  type Document,
  type Suggestion,
  type Vote,
  VoteModel,
} from "./schema";
import { connectDB } from "./connection";

// Transform a lean Mongoose doc where _id IS the UUID into our plain type
function withId(doc: any): any {
  const { _id, __v, ...rest } = doc;
  return { id: String(_id), ...rest };
}

// Transform a lean Mongoose Document doc (has `id` field, auto ObjectId _id)
function fromDocumentDoc(doc: any): Document {
  const { _id, __v, ...rest } = doc;
  return rest as Document;
}

function fromSuggestionDoc(doc: any): Suggestion {
  const { _id, __v, ...rest } = doc;
  return { id: String(_id), ...rest } as Suggestion;
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    await connectDB();
    return await ChatModel.create({
      _id: id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await connectDB();
    await VoteModel.deleteMany({ chatId: id });
    await MessageModel.deleteMany({ chatId: id });
    const deleted = await ChatModel.findByIdAndDelete(id).lean();
    return deleted ? withId(deleted) : null;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    await connectDB();
    const userChats = await ChatModel.find({ userId }).select("_id").lean();
    if (userChats.length === 0) return { deletedCount: 0 };

    const chatIds = userChats.map((c: any) => String(c._id));
    await VoteModel.deleteMany({ chatId: { $in: chatIds } });
    await MessageModel.deleteMany({ chatId: { $in: chatIds } });
    const result = await ChatModel.deleteMany({ userId });
    return { deletedCount: result.deletedCount };
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    await connectDB();
    const extendedLimit = limit + 1;
    let filter: Record<string, any> = { userId: id };

    if (startingAfter) {
      const anchor = await ChatModel.findById(startingAfter).lean();
      if (!anchor) {
        throw new ChatbotError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`
        );
      }
      filter = { userId: id, createdAt: { $gt: (anchor as any).createdAt } };
    } else if (endingBefore) {
      const anchor = await ChatModel.findById(endingBefore).lean();
      if (!anchor) {
        throw new ChatbotError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`
        );
      }
      filter = { userId: id, createdAt: { $lt: (anchor as any).createdAt } };
    }

    const chats = await ChatModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(extendedLimit)
      .lean();

    const hasMore = chats.length > limit;
    return {
      chats: (hasMore ? chats.slice(0, limit) : chats).map(withId) as Chat[],
      hasMore,
    };
  } catch (_error) {
    if (_error instanceof ChatbotError) throw _error;
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({
  id,
}: {
  id: string;
}): Promise<Chat | null> {
  try {
    await connectDB();
    const doc = await ChatModel.findById(id).lean();
    return doc ? (withId(doc) as Chat) : null;
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  try {
    await connectDB();
    const docs = messages.map((m) => ({
      _id: m.id,
      chatId: m.chatId,
      role: m.role,
      parts: m.parts,
      attachments: m.attachments,
      createdAt: m.createdAt,
    }));
    return await MessageModel.insertMany(docs);
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to save messages");
  }
}

export async function updateMessage({
  id,
  parts,
}: {
  id: string;
  parts: DBMessage["parts"];
}) {
  try {
    await connectDB();
    return await MessageModel.updateOne({ _id: id }, { $set: { parts } });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to update message");
  }
}

export async function getMessagesByChatId({
  id,
}: {
  id: string;
}): Promise<DBMessage[]> {
  try {
    await connectDB();
    const docs = await MessageModel.find({ chatId: id })
      .sort({ createdAt: 1 })
      .lean();
    return docs.map(withId) as DBMessage[];
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    await connectDB();
    const existing = await VoteModel.findOne({ messageId }).lean();
    if (existing) {
      return await VoteModel.updateOne(
        { messageId, chatId },
        { $set: { isUpvoted: type === "up" } }
      );
    }
    return await VoteModel.create({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({
  id,
}: {
  id: string;
}): Promise<Vote[]> {
  try {
    await connectDB();
    const docs = await VoteModel.find({ chatId: id }).lean();
    return docs.map(({ _id, __v, ...rest }: any) => rest) as Vote[];
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}): Promise<Document[]> {
  try {
    await connectDB();
    const doc = await DocumentModel.create({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
    return [fromDocumentDoc(doc.toObject())];
  } catch (_error) {
    throw new ChatbotError("bad_request:database", "Failed to save document");
  }
}

export async function updateDocumentContent({
  id,
  content,
}: {
  id: string;
  content: string;
}): Promise<Document[]> {
  try {
    await connectDB();
    const latest = await DocumentModel.findOne({ id })
      .sort({ createdAt: -1 })
      .lean();
    if (!latest)
      throw new ChatbotError("not_found:database", "Document not found");

    const updated = await DocumentModel.findOneAndUpdate(
      { id, createdAt: (latest as any).createdAt },
      { $set: { content } },
      { new: true }
    ).lean();

    return updated ? [fromDocumentDoc(updated)] : [];
  } catch (_error) {
    if (_error instanceof ChatbotError) throw _error;
    throw new ChatbotError(
      "bad_request:database",
      "Failed to update document content"
    );
  }
}

export async function getDocumentsById({
  id,
}: {
  id: string;
}): Promise<Document[]> {
  try {
    await connectDB();
    const docs = await DocumentModel.find({ id }).sort({ createdAt: 1 }).lean();
    return docs.map(fromDocumentDoc);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }
}

export async function getDocumentById({
  id,
}: {
  id: string;
}): Promise<Document | undefined> {
  try {
    await connectDB();
    const doc = await DocumentModel.findOne({ id })
      .sort({ createdAt: -1 })
      .lean();
    return doc ? fromDocumentDoc(doc) : undefined;
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}): Promise<Document[]> {
  try {
    await connectDB();
    await SuggestionModel.deleteMany({
      documentId: id,
      documentCreatedAt: { $gt: timestamp },
    });

    const toDelete = await DocumentModel.find({
      id,
      createdAt: { $gt: timestamp },
    }).lean();

    await DocumentModel.deleteMany({ id, createdAt: { $gt: timestamp } });
    return toDelete.map(fromDocumentDoc);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete documents by id after timestamp"
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  try {
    await connectDB();
    const docs = suggestions.map((s) => ({ ...s, _id: s.id }));
    return await SuggestionModel.insertMany(docs);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to save suggestions"
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}): Promise<Suggestion[]> {
  try {
    await connectDB();
    const docs = await SuggestionModel.find({ documentId }).lean();
    return docs.map(fromSuggestionDoc);
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }
}

export async function getMessageById({
  id,
}: {
  id: string;
}): Promise<DBMessage[]> {
  try {
    await connectDB();
    const docs = await MessageModel.find({ _id: id }).lean();
    return docs.map(withId) as DBMessage[];
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    await connectDB();
    const toDelete = await MessageModel.find({
      chatId,
      createdAt: { $gte: timestamp },
    })
      .select("_id")
      .lean();

    const messageIds = toDelete.map((m: any) => String(m._id));
    if (messageIds.length > 0) {
      await VoteModel.deleteMany({ chatId, messageId: { $in: messageIds } });
      await MessageModel.deleteMany({ chatId, _id: { $in: messageIds } });
    }
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    await connectDB();
    return await ChatModel.updateOne({ _id: chatId }, { $set: { visibility } });
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatTitleById({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  try {
    await connectDB();
    return await ChatModel.updateOne({ _id: chatId }, { $set: { title } });
  } catch (_error) {
    return;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}): Promise<number> {
  try {
    await connectDB();
    const cutoffTime = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );
    const userChats = await ChatModel.find({ userId: id }).select("_id").lean();
    const chatIds = userChats.map((c: any) => String(c._id));
    return await MessageModel.countDocuments({
      chatId: { $in: chatIds },
      createdAt: { $gte: cutoffTime },
      role: "user",
    });
  } catch (_error) {
    throw new ChatbotError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }
}
