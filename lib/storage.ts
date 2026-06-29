import "server-only";

import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT ?? "http://localhost:9000",
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
  },
  forcePathStyle: true,
});

export const FILES_BUCKET = "files";

export function filePublicUrl(key: string): string {
  const base = process.env.MINIO_PUBLIC_URL ?? "http://localhost:9000";
  return `${base}/${FILES_BUCKET}/${key}`;
}
