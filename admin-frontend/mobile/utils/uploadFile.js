// On a phone, React Native's FormData understands the `{ uri, name, type }`
// object that the image and video pickers return, so nothing needs to change.
// The browser build swaps this module for uploadFile.web.js.
export const toUploadFile = async (file) => file;
