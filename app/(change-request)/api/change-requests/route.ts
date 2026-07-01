import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/app/(auth)/auth";
import { createChangeRequest, listChangeRequests } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const changeRequests = await listChangeRequests(session.user.id);
  return NextResponse.json(changeRequests);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title } = await req.json();
  const id = uuidv4();
  const changeRequest = await createChangeRequest(
    id,
    session.user.id,
    title ?? "New Change-Request"
  );
  return NextResponse.json(changeRequest, { status: 201 });
}
