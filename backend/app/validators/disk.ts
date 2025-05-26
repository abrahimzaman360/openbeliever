import vine from "@vinejs/vine";

export const validateUploadedFiles = vine.compile(
  vine.array(
    vine.file({
      size: "15mb",
      extnames: ["gif", "jpg", "jpeg", "png", "webp", "mp4", "webm"],
    })
  ),
)
