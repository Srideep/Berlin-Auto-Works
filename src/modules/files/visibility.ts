export const fileVisibilities = ["customer", "internal"] as const;

export type FileVisibility = (typeof fileVisibilities)[number];

/**
 * Object storage metadata. The file bytes stay in object storage.
 * Customer portal reads must filter to visibility "customer".
 */
export interface StoredFile {
  id: string;
  locationId: string;
  visibility: FileVisibility;
  objectKey: string;
  contentType: string;
}
