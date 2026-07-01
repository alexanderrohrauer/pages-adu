import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  appendMessage,
  getChangeRequestById,
  loadMessages,
} from "@/lib/db/queries";

type Params = { params: Promise<{ id: string }> };

async function authorize(id: string) {
  const session = await auth();
  if (!session?.user?.id)
    return { error: "Unauthorized", status: 401 } as const;
  const cr = await getChangeRequestById(id);
  if (!cr) return { error: "Not found", status: 404 } as const;
  if (cr.userId !== session.user.id)
    return { error: "Forbidden", status: 403 } as const;
  return { ok: true } as const;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const check = await authorize(id);
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const entries = await loadMessages(id);
  return NextResponse.json(entries);
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params;
  const check = await authorize(id);
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const entry: {
    id: string;
    parent_id: string | null;
    format: string;
    content: unknown;
  } = await req.json();

  if (!entry.id || !entry.format) {
    return NextResponse.json(
      { error: "id and format required" },
      { status: 400 }
    );
  }

  await appendMessage(
    id,
    entry.id,
    entry.parent_id ?? null,
    entry.format,
    entry.content
  );
  return new NextResponse(null, { status: 204 });
}
