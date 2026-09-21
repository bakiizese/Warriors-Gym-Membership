import {
  Image as RNImage,
  ImageBackground as RNImageBackground,
} from "react-native";

// React Native Web writes a bundled image's original size as an inline style,
// which beats Tailwind size classes such as `h-12 w-12`, so on the web every
// image showed at full size (a 512px avatar, banners overflowing their cards).
// Dropping the width and height from the source leaves the size to the classes,
// as on a phone. Images with no className keep their natural size.
const withoutNaturalSize = (source, className) => {
  if (!className) return source;
  if (typeof source === "number") {
    return { uri: RNImage.resolveAssetSource(source)?.uri };
  }
  if (source && typeof source === "object" && !Array.isArray(source)) {
    const { width, height, ...rest } = source; // eslint-disable-line no-unused-vars
    return rest;
  }
  return source;
};

export const Image = ({ source, className, ...props }) => (
  <RNImage
    source={withoutNaturalSize(source, className)}
    className={className}
    {...props}
  />
);

export const ImageBackground = ({ source, className, ...props }) => (
  <RNImageBackground
    source={withoutNaturalSize(source, className)}
    className={className}
    {...props}
  />
);

export default Image;
