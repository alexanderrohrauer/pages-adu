import { NextResponse } from "next/server";
import {
  deleteChangeRequest,
  getArtifactById,
  getChangeRequestById,
  renameChangeRequest,
} from "@/lib/db/queries";

type Params = { params: Promise<{ id: string }> };

async function resolveChangeRequest(id: string) {
  const cr = await getChangeRequestById(id);
  if (!cr) return { error: "Not found", status: 404 } as const;
  return { cr };
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const result = await resolveChangeRequest(id);
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  const artifact = await getArtifactById(result.cr.artifactId);
  return NextResponse.json({
    ...result.cr,
    technicalName: artifact?.technicalName,
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const result = await resolveChangeRequest(id);
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  await deleteChangeRequest(id);
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const result = await resolveChangeRequest(id);
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  const { title } = await req.json();
  if (typeof title === "string") {
    await renameChangeRequest(id, title);
  }

  return new NextResponse(null, { status: 204 });
}
