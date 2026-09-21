// True for an address that can be used as it is, without adding the server
// address in front: a file saved on the phone (file://), a server address
// (http/https, what the browser build "downloads" to) or a file picked in the
// browser (blob:, data:). Anything else is a path relative to the server.
export const isFullUri = (path) =>
  typeof path === "string" && /^(file|https?|blob|data):/.test(path);
