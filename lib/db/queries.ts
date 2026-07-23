import "server-only";

import { connectDB } from "./connection";
import {
  Artifact,
  ArtifactModel,
  ChangeRequest,
  ChangeRequestModel,
  MessageModel,
} from "./schema";

function toArtifact(doc: {
  _id: string;
  name: string;
  technicalName: string;
  createdAt: Date;
}): Artifact {
  return {
    id: doc._id.toString(),
    name: doc.name,
    technicalName: doc.technicalName,
    createdAt: doc.createdAt,
  };
}

function toChangeRequest(doc: {
  _id: string;
  createdAt: Date;
  title: string;
  artifactId: string;
  path?: string;
}): ChangeRequest {
  return {
    id: doc._id.toString(),
    createdAt: doc.createdAt,
    title: doc.title,
    artifactId: doc.artifactId,
    path: doc.path,
  };
}

export async function getArtifactById(id: string): Promise<Artifact | null> {
  await connectDB();
  const doc = await ArtifactModel.findById(id).lean();
  if (!doc) return null;
  return toArtifact(
    doc as unknown as {
      _id: string;
      name: string;
      technicalName: string;
      createdAt: Date;
    }
  );
}

export async function listArtifacts(): Promise<Artifact[]> {
  await connectDB();
  const docs = await ArtifactModel.find().sort({ createdAt: -1 }).lean();
  return docs.map((doc) =>
    toArtifact(
      doc as unknown as {
        _id: string;
        name: string;
        technicalName: string;
        createdAt: Date;
      }
    )
  );
}

export async function getArtifactByTechnicalName(
  technicalName: string
): Promise<Artifact | null> {
  await connectDB();
  const doc = await ArtifactModel.findOne({ technicalName }).lean();
  if (!doc) return null;
  return toArtifact(
    doc as unknown as {
      _id: string;
      name: string;
      technicalName: string;
      createdAt: Date;
    }
  );
}

export async function isArtifactTechnicalNameTaken(
  technicalName: string
): Promise<boolean> {
  await connectDB();
  const doc = await ArtifactModel.findOne({ technicalName }).lean();
  return doc !== null;
}

export async function createArtifact(
  id: string,
  name: string,
  technicalName: string
): Promise<Artifact> {
  await connectDB();
  const doc = await ArtifactModel.create({
    _id: id,
    name,
    technicalName,
    createdAt: new Date(),
  });
  return toArtifact({
    _id: doc._id.toString(),
    name: doc.name,
    technicalName: doc.technicalName,
    createdAt: doc.createdAt,
  });
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
      artifactId: string;
      path?: string;
    }
  );
}

export async function listChangeRequests(
  artifactId?: string
): Promise<ChangeRequest[]> {
  await connectDB();
  const docs = await ChangeRequestModel.find(artifactId ? { artifactId } : {})
    .sort({ createdAt: -1 })
    .lean();
  return docs.map((doc) =>
    toChangeRequest(
      doc as unknown as {
        _id: string;
        createdAt: Date;
        title: string;
        artifactId: string;
        path?: string;
      }
    )
  );
}

export async function createChangeRequest(
  id: string,
  artifactId: string,
  title: string
): Promise<ChangeRequest> {
  await connectDB();
  const doc = await ChangeRequestModel.create({
    _id: id,
    createdAt: new Date(),
    title,
    artifactId,
  });
  return toChangeRequest({
    _id: doc._id.toString(),
    createdAt: doc.createdAt,
    title: doc.title,
    artifactId: doc.artifactId,
  });
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

export async function updateChangeRequestPath(
  id: string,
  path: string
): Promise<void> {
  await connectDB();
  const res = await ChangeRequestModel.updateOne(
    { _id: id },
    { $set: { path } }
  );
  console.log(id, path, res);
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
