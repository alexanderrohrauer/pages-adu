import { type NextRequest, NextResponse } from "next/server";
import { getArtifactByTechnicalName } from "@/lib/db/queries";

type Params = {
  params: Promise<{ technicalName: string; path?: string[] }>;
};

const REQUEST_HOP_BY_HOP_HEADERS = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
];

const RESPONSE_STRIPPED_HEADERS = [
  "content-encoding",
  "content-length",
  "x-frame-options",
  "content-security-policy",
];

function buildTargetUrl(
  sandboxUrl: string,
  path: string[] | undefined,
  search: string
): string {
  const base = sandboxUrl.endsWith("/") ? sandboxUrl : `${sandboxUrl}/`;
  const suffix = path?.join("/") ?? "";
  return `${new URL(suffix, base).toString()}${search}`;
}

async function proxy(request: NextRequest, { params }: Params) {
  const { technicalName, path } = await params;

  const artifact = await getArtifactByTechnicalName(technicalName);
  if (!artifact?.sandboxUrl) {
    return new NextResponse("Sandbox is not deployed", { status: 502 });
  }

  const targetUrl = buildTargetUrl(
    artifact.sandboxUrl,
    path,
    request.nextUrl.search
  );

  const headers = new Headers(request.headers);
  for (const header of REQUEST_HOP_BY_HOP_HEADERS) headers.delete(header);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      redirect: "manual",
      ...(hasBody ? { duplex: "half" } : {}),
    } as RequestInit);
  } catch {
    return new NextResponse("Sandbox is not reachable", { status: 502 });
  }

  const responseHeaders = new Headers(response.headers);
  for (const header of RESPONSE_STRIPPED_HEADERS)
    responseHeaders.delete(header);

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
};
