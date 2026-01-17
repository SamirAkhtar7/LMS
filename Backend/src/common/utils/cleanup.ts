import fs from "fs";

const cleanupFiles = (files?: Express.Multer.File[]) => {
  if (!files) return;
  for (const file of files) {
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error(`Failed to cleanup file ${file.path}:`, err);
      }
    }
  }
};
export { cleanupFiles };
