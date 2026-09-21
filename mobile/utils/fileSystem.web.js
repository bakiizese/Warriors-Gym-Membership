// A browser has no app storage to download into, so nothing is ever "already
// saved" and "downloading" a file just returns its address. The page then loads
// images and videos straight from the server. Only the four calls the app uses
// are provided.
export const documentDirectory = "";

export const getInfoAsync = async () => ({ exists: false });

export const downloadAsync = async (url) => ({ uri: url });

export const deleteAsync = async () => {};
