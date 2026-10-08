import { ImageResponse } from "next/og";
import { Mark } from "@/lib/brand-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#0a0a0a",
      }}
    >
      <Mark size={108} color="#fafafa" />
    </div>,
    size,
  );
}
