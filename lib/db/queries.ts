import "server-only";

import { connectDB } from "./connection";
import { ChangeRequest, ChangeRequestModel, MessageModel } from "./schema";

function toChangeRequest(doc: {
  _id: string;
  createdAt: Date;
  title: string;
  userId: string;
}): ChangeRequest {
  return {
    id: doc._id.toString(),
    createdAt: doc.createdAt,
    title: doc.title,
    userId: doc.userId,
  };
}

export async function getChangeRequestById(
  id: string
): Promise<ChangeRequest | null> {
  await connectDB();
  const doc = await ChangeRequestModel.findById(id).lean();
  if (!doc) return null;
  return toChangeRequest(
    doc as unknown as {
      _id: string;
      createdAt: Date;
      title: string;
      userId: string;
    }
  );
}

export async function listChangeRequests(
  userId: string
): Promise<ChangeRequest[]> {
  await connectDB();
  const docs = await ChangeRequestModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean();
  return docs.map((doc) =>
    toChangeRequest(
      doc as unknown as {
        _id: string;
        createdAt: Date;
        title: string;
        userId: string;
      }
    )
  );
}

export async function createChangeRequest(
  id: string,
  userId: string,
  title: string
): Promise<ChangeRequest> {
  await connectDB();
  const doc = await ChangeRequestModel.create({
    _id: id,
    createdAt: new Date(),
    title,
    userId,
  });
  return {
    id: doc._id.toString(),
    createdAt: doc.createdAt,
    title: doc.title,
    userId: doc.userId,
  };
}

export async function deleteChangeRequest(id: string): Promise<void> {
  await connectDB();
  await ChangeRequestModel.deleteOne({ _id: id });
  await MessageModel.deleteMany({ changeRequestId: id });
}

export async function renameChangeRequest(
  id: string,
  title: string
): Promise<void> {
  await connectDB();
  await ChangeRequestModel.updateOne({ _id: id }, { $set: { title } });
}

export async function loadMessages(changeRequestId: string): Promise<
  Array<{
    id: string;
    parent_id: string | null;
    format: string;
    content: unknown;
  }>
> {
  await connectDB();
  const docs = await MessageModel.find({ changeRequestId })
    .sort({ createdAt: 1 })
    .lean();
  return docs.map((d) => ({
    id: d._id.toString(),
    parent_id: (d.parent_id as string | null) ?? null,
    format: d.format as string,
    content: d.content,
  }));
}

export async function appendMessage(
  changeRequestId: string,
  id: string,
  parent_id: string | null,
  format: string,
  content: unknown
): Promise<void> {
  await connectDB();
  await MessageModel.updateOne(
    { _id: id },
    {
      $setOnInsert: {
        _id: id,
        changeRequestId,
        parent_id,
        format,
        content,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );
}
