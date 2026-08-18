import { NextResponse } from "next/server";
import { removeClonedRepo } from "@/lib/artifacts";
import { deleteArtifact, getArtifactById } from "@/lib/db/queries";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const artifact = await getArtifactById(id);

  if (!artifact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(artifact);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const artifact = await getArtifactById(id);
  if (!artifact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteArtifact(id);

  try {
    await removeClonedRepo(artifact.technicalName);
  } catch (err) {
    console.error("Failed to remove artifact repository", err);
  }

  return new NextResponse(null, { status: 204 });
}
