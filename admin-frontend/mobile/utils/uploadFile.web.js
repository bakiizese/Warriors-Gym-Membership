// Browsers cannot append a `{ uri, name, type }` object to FormData: it would be
// sent as the text "[object Object]". Fetch the picked file and hand FormData a
// real File instead. "No file" (empty, or the `{}` placeholder) becomes an empty
// string, and an existing server path sent back unchanged passes through.
export const toUploadFile = async (file) => {
  if (!file) return "";
  if (typeof file !== "object") return file;
  if (!file.uri) return "";
  const blob = await (await fetch(file.uri)).blob();
  const type = file.type || blob.type || "application/octet-stream";
  return new File([blob], file.name || "upload", { type });
};
