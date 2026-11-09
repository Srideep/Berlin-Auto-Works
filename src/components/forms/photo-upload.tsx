"use client";

import { useState } from "react";

interface PhotoUploadProps {
  id: string;
}

export function PhotoUpload({ id }: PhotoUploadProps) {
  const [fileId, setFileId] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("Optional. JPEG, PNG, or WebP, up to 5 MB.");
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        className="block w-full text-sm text-ink"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) {
            return;
          }
          setBusy(true);
          setMessage("Uploading…");
          void uploadPhoto(file)
            .then((result) => {
              if (!result.ok) {
                setFileId("");
                setToken("");
                setMessage(result.message);
                return;
              }
              setFileId(result.fileId);
              setToken(result.token);
              setMessage("Photo attached. It is sent with this request.");
            })
            .catch(() => {
              setFileId("");
              setToken("");
              setMessage("The photo could not be uploaded.");
            })
            .finally(() => {
              setBusy(false);
            });
        }}
      />
      <input type="hidden" name="fileId" value={fileId} />
      <input type="hidden" name="fileToken" value={token} />
      <p className="mt-1 text-sm text-muted">{message}</p>
    </div>
  );
}

async function uploadPhoto(
  file: File,
): Promise<{ ok: true; fileId: string; token: string } | { ok: false; message: string }> {
  const response = await fetch("/api/files/sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contentType: file.type, byteSize: file.size }),
  });
  const body = (await response.json()) as {
    fileId?: string;
    token?: string;
    uploadUrl?: string;
    error?: string;
  };
  if (!response.ok || !body.fileId || !body.token || !body.uploadUrl) {
    return { ok: false, message: body.error ?? "Photo upload is not configured." };
  }
  const put = await fetch(body.uploadUrl, {
    method: "PUT",
    headers: { "content-type": file.type },
    body: file,
  });
  if (!put.ok) {
    return { ok: false, message: "The photo could not be stored." };
  }
  return { ok: true, fileId: body.fileId, token: body.token };
}
