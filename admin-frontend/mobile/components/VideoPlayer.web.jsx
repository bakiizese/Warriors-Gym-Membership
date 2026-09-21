import { Image } from "react-native";

// A plain <video> with the handful of props the screens pass to
// react-native-video. `source` is either `{ uri }` or a bundled asset number.
const VideoPlayer = ({
  source,
  style,
  resizeMode = "contain",
  paused = false,
  muted = false,
  controls = false,
  repeat = false,
  onLoad,
  onError,
}) => {
  const uri =
    typeof source === "number"
      ? Image.resolveAssetSource(source)?.uri
      : source?.uri;

  return (
    <video
      key={uri}
      src={uri}
      style={{ objectFit: resizeMode, ...style }}
      autoPlay={!paused}
      // Browsers only autoplay muted video; the controls let the user unmute.
      muted={muted || !paused}
      loop={repeat}
      controls={controls}
      preload="metadata"
      playsInline
      onLoadedData={onLoad}
      onError={onError}
    />
  );
};

export default VideoPlayer;
