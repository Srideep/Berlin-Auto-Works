import "server-only";

import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getDb } from "@/lib/db";
import { getActiveLocation } from "@/modules/locations/active";
import { createToken, hashToken } from "@/modules/identity/password";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"] as const;
const maxBytes = 5_000_000;

export function filesConfigured(): boolean {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_REGION &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY,
  );
}

function client(): S3Client {
  return new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    },
  });
}

export async function createSignedUpload(input: {
  contentType: string;
  byteSize: number;
}): Promise<
  | { ok: true; fileId: string; token: string; uploadUrl: string }
  | { ok: false; message: string }
> {
  if (!filesConfigured() || !process.env.DATABASE_URL) {
    return { ok: false, message: "Photo upload is not configured." };
  }
  if (!allowedTypes.some((type) => type === input.contentType)) {
    return { ok: false, message: "Upload a JPEG, PNG, or WebP image." };
  }
  if (!Number.isInteger(input.byteSize) || input.byteSize < 1 || input.byteSize > maxBytes) {
    return { ok: false, message: "Keep the photo under 5 MB." };
  }
  const location = await getActiveLocation();
  if (!location) {
    return { ok: false, message: "The shop record is not available." };
  }

  const token = createToken();
  const file = await getDb().storedFile.create({
    data: {
      locationId: location.id,
      visibility: "customer",
      objectKey: `pending/${token}`,
      contentType: input.contentType,
      byteSize: input.byteSize,
      uploadTokenHash: hashToken(token),
    },
    select: { id: true },
  });
  const objectKey = `locations/${location.id}/uploads/${file.id}`;
  await getDb().storedFile.update({
    where: { id: file.id },
    data: { objectKey },
  });

  const uploadUrl = await getSignedUrl(
    client(),
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: objectKey,
      ContentType: input.contentType,
      ContentLength: input.byteSize,
    }),
    { expiresIn: 300 },
  );

  return { ok: true, fileId: file.id, token, uploadUrl };
}

export async function attachUploadedFile(input: {
  fileId: string;
  token: string;
  appointmentId?: string;
  estimateId?: string;
}): Promise<boolean> {
  if (!filesConfigured() || !input.fileId || !input.token) {
    return false;
  }
  const file = await getDb().storedFile.findUnique({ where: { id: input.fileId } });
  if (!file || file.uploadTokenHash !== hashToken(input.token)) {
    return false;
  }
  if (file.appointmentId || file.estimateId) {
    return false;
  }
  try {
    await client().send(
      new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: file.objectKey,
      }),
    );
  } catch {
    return false;
  }
  await getDb().storedFile.update({
    where: { id: file.id },
    data: {
      appointmentId: input.appointmentId,
      estimateId: input.estimateId,
    },
  });
  return true;
}
