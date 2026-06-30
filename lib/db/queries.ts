import "server-only";

import { connectDB } from "./connection";
import { ChangeRequest, ChangeRequestModel } from "./schema";

export async function getChangeRequestById(
  id: string
): Promise<ChangeRequest | null> {
  await connectDB();
  const doc = await ChangeRequestModel.findById(id).lean();
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    createdAt: doc.createdAt,
    title: doc.title,
    userId: doc.userId,
  };
}
