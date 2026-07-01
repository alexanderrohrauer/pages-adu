import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  deleteChangeRequest,
  getChangeRequestById,
  renameChangeRequest,
} from "@/lib/db/queries";

type Params = { params: Promise<{ id: string }> };

async function resolveOwned(id: string, userId: string) {
  const cr = await getChangeRequestById(id);
  if (!cr) return { error: "Not found", status: 404 } as const;
  if (cr.userId !== userId) return { error: "Forbidden", status: 403 } as const;
  return { cr };
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await resolveOwned(id, session.user.id);
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  return NextResponse.json(result.cr);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await resolveOwned(id, session.user.id);
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const result = await resolveOwned(id, session.user.id);
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
