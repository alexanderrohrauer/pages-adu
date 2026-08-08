import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const { open } = await req.json();
  const provideCookies = await cookies();
  provideCookies.set("PAGES_PREVIEW_OPEN", open, { path: "/" });
  return NextResponse.json({ ok: true });
}
