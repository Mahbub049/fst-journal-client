export const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${sizes[index]}`;
};