import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { FILES_BUCKET, filePublicUrl, s3 } from "@/lib/storage";

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    .refine((file) => ["image/jpeg", "image/png"].includes(file.type), {
      message: "File type should be JPEG or PNG",
    }),
});

async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: FILES_BUCKET }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: FILES_BUCKET }));
    await s3.send(
      new PutBucketPolicyCommand({
        Bucket: FILES_BUCKET,
        Policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${FILES_BUCKET}/*`],
            },
          ],
        }),
      })
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const originalName = (formData.get("file") as File).name;
    const ext = originalName.split(".").pop() ?? "bin";
    const key = `${nanoid()}.${ext}`;

    await ensureBucket();
    await s3.send(
      new PutObjectCommand({
        Bucket: FILES_BUCKET,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: file.type,
      })
    );

    const url = filePublicUrl(key);
    return NextResponse.json({ url, pathname: key });
  } catch (_error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
