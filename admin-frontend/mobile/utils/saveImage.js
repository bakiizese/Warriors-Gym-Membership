import * as FileSystem from "expo-file-system/legacy";

const saveImage = async (user) => {
  const ADDRESS = process.env.EXPO_PUBLIC_ADDRESS;

  const fileUri = user?.image;
  try {
    const filename = fileUri?.split("/").pop();
    const localpath = FileSystem.documentDirectory + filename;
    const checkFile = await FileSystem.getInfoAsync(localpath);

    if (checkFile.exists) {
      user.image = checkFile.uri;
      // await AsyncStorage.setItem("userData", JSON.stringify(user));
      return user;
    }

    const { uri } = await FileSystem.downloadAsync(
      `${ADDRESS}/${fileUri}`,
      localpath,
    );
    if (uri) {
      user.image = uri;
      // await AsyncStorage.setItem("userData", JSON.stringify(user));
    }
    return uri;
  } catch (err) {
    console.log(err);
    return 0;
  }
};

export default saveImage;
