import * as FileSystem from "expo-file-system/legacy";

const saveImage = async (image) => {
  const ADDRESS = process.env.EXPO_PUBLIC_ADDRESS;
  const fileUri = image;
  try {
    const filename = fileUri?.split("/").pop();
    const localpath = FileSystem.documentDirectory + filename;
    const checkFile = await FileSystem.getInfoAsync(localpath);

    if (checkFile.exists) {
      image = checkFile.uri;
      console.log("image exists");
      return image;
    }

    const { uri } = await FileSystem.downloadAsync(
      `${ADDRESS}/${fileUri}`,
      localpath,
    );
    if (uri) {
      image = uri;
    }
    console.log("image saved");
    return uri;
  } catch (err) {
    console.log(err);
    return 0;
  }
};

export default saveImage;
