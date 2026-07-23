import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { cloneTemplateRepo, reserveTechnicalName } from "@/lib/artifacts/clone";
import {
  createArtifact,
  isArtifactTechnicalNameTaken,
  listArtifacts,
} from "@/lib/db/queries";

export async function GET() {
  const artifacts = await listArtifacts();
  return NextResponse.json(artifacts);
}

export async function POST(req: Request) {
  const { name } = await req.json();
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const technicalName = await reserveTechnicalName(
    name,
    isArtifactTechnicalNameTaken
  );

  try {
    await cloneTemplateRepo(technicalName);
  } catch (err) {
    console.error("Failed to clone template repository", err);
    return NextResponse.json(
      { error: "Failed to create artifact repository" },
      { status: 500 }
    );
  }

  const id = uuidv4();
  const artifact = await createArtifact(id, name.trim(), technicalName);
  return NextResponse.json(artifact, { status: 201 });
}
