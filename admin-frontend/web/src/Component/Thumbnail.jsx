import { useEffect, useState } from "react";

const Thumbnail = ({ videoUrl }) => {
  const [thumbnail, setThumbnail] = useState(null);
  const ADDRESS = import.meta.env.VITE_ADDRESS;
  useEffect(() => {
    if (!videoUrl) return;
    const createThumbnail = async () => {
      try {
        const res = await fetch(`http://${ADDRESS}/${videoUrl}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        const video = document.createElement("video");
        video.src = url;
        video.muted = true;

        video.addEventListener("loadeddata", () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas
            .getContext("2d")
            .drawImage(video, 0, 0, canvas.width, canvas.height);
          setThumbnail(canvas.toDataURL("image/jpeg"));
          URL.revokeObjectURL(url);
        });
      } catch (err) {
        console.error(err);
      }
    };

    createThumbnail();
  }, [videoUrl]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "16px",
        overflow: "hidden",
        backgroundColor: "#000",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt="video thumbnail"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span style={{ color: "white", fontSize: "2rem" }}>Loading...</span>
      )}
    </div>
  );
};

export default Thumbnail;
