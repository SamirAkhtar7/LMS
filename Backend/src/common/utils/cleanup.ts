import fs from "fs";

const cleanupFiles = (files?: Express.Multer.File[]) => {
  if (!files) return;
  for (const file of files) {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
};
export { cleanupFiles };