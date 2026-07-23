import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  createChangeRequest,
  getArtifactById,
  listChangeRequests,
} from "@/lib/db/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const artifactId = searchParams.get("artifactId") ?? undefined;

  const changeRequests = await listChangeRequests(artifactId);
  return NextResponse.json(changeRequests);
}

export async function POST(req: Request) {
  const { title, artifactId } = await req.json();
  if (typeof artifactId !== "string" || !artifactId) {
    return NextResponse.json(
      { error: "artifactId is required" },
      { status: 400 }
    );
  }

  const artifact = await getArtifactById(artifactId);
  if (!artifact) {
    return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  }

  const id = uuidv4();
  const changeRequest = await createChangeRequest(
    id,
    artifactId,
    title ?? "New Change-Request"
  );
  return NextResponse.json(changeRequest, { status: 201 });
}
