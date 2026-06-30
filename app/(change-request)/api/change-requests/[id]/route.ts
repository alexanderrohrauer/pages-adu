import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getChangeRequestById } from "@/lib/db/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const changeRequest = await getChangeRequestById(id);

  if (!changeRequest) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (changeRequest.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(changeRequest);
}
