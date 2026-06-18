import sharp from "sharp";
import path from "path";
import prisma from "../db/config";

const uploadsDir = "uploads";

// Process one file: save the original + optional thumbnail, return a Media row
const processFile = async (
  file: Express.Multer.File,
  index: number,
  alt: string | null,
  storeThumbnail: boolean,
) => {
  // Unique name so files don't overwrite each other
  const base = `${Date.now()}-${index}-${Math.round(Math.random() * 1e9)}`;
  const originalName = `${base}-original.webp`;
  const originalPath = path.join(uploadsDir, originalName);

  // Save the original image
  await sharp(file.buffer).webp({ quality: 90 }).toFile(originalPath);

  // Save a small thumbnail only if asked
  let thumbnailUrl: string | null = null;
  if (storeThumbnail) {
    const thumbName = `${base}-thumb.webp`;
    const thumbPath = path.join(uploadsDir, thumbName);
    await sharp(file.buffer)
      .resize(300, 300, { fit: "inside" })
      .webp({ quality: 80 })
      .toFile(thumbPath);
    thumbnailUrl = `/uploads/${thumbName}`;
  }

  return {
    name: file.originalname,
    alt,
    url: `/uploads/${originalName}`,
    thumbnail_url: thumbnailUrl,
    mime_type: "image/webp",
  };
};

export const uploadMediaFiles = async (
  files: Express.Multer.File[],
  alt: string | null,
  storeThumbnail: boolean,
) => {
  // Handle each file in parallel
  const mediaData = await Promise.all(
    files.map((file, index) =>
      processFile(file, index, alt, storeThumbnail),
    ),
  );

  return prisma.media.createManyAndReturn({ data: mediaData });
};
