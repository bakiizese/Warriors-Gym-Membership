import { Image, Text, View } from "react-native";

// expo-video-thumbnails has no web implementation, so the browser shows the
// video's own first frame instead of a generated image.
const Thumbnail = ({ videoUri }) => {
  const uri =
    typeof videoUri === "number"
      ? Image.resolveAssetSource(videoUri)?.uri
      : videoUri;

  return (
    <View className="h-full w-full rounded-3xl justify-center items-center overflow-hidden">
      {uri ? (
        <video
          src={`${uri}#t=0.5`}
          preload="metadata"
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Text className="text-white text-3xl">Video</Text>
      )}
    </View>
  );
};

export default Thumbnail;
