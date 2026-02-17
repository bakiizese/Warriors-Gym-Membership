import * as VideoThumbnails from "expo-video-thumbnails";
import { useState, useEffect } from "react";
import { View, Image, Text } from "react-native";

const Thumbnail = ({ videoUri }) => {
  const [thumbnail, setThumbnail] = useState(null);
  try {
    useEffect(() => {
      const genThumbnail = async () => {
        if (!videoUri.includes("file://")) {
          setThumbnail(null);
          return;
        }
        const newVideoUri = videoUri;
        const { uri } = await VideoThumbnails.getThumbnailAsync(newVideoUri, {
          time: 500,
        });
        setThumbnail(uri);
      };
      genThumbnail();
    }, []);
  } catch {
    setThumbnail(null);
  }

  return (
    <View className="h-full w-full rounded-3xl justify-center items-center">
      {thumbnail ? (
        <Image
          source={{ uri: thumbnail }}
          resizeMode="cover"
          className="h-full w-full rounded-2xl "
        />
      ) : (
        <Text className="text-white text-3xl">Video</Text>
      )}
    </View>
  );
};

export default Thumbnail;
