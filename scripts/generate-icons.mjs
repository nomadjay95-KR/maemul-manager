import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { writeFileSync } from "fs";

// macOS 한글 폰트 등록
GlobalFonts.registerFromPath("/System/Library/Fonts/AppleSDGothicNeo.ttc", "AppleSDGothicNeo");

const BG_COLOR = "#0066FF";
const sizes = [192, 512];

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // 둥근 모서리 배경
  const rx = size * 0.15;
  ctx.beginPath();
  ctx.moveTo(rx, 0);
  ctx.lineTo(size - rx, 0);
  ctx.quadraticCurveTo(size, 0, size, rx);
  ctx.lineTo(size, size - rx);
  ctx.quadraticCurveTo(size, size, size - rx, size);
  ctx.lineTo(rx, size);
  ctx.quadraticCurveTo(0, size, 0, size - rx);
  ctx.lineTo(0, rx);
  ctx.quadraticCurveTo(0, 0, rx, 0);
  ctx.closePath();
  ctx.fillStyle = BG_COLOR;
  ctx.fill();

  // "하나" 텍스트
  const fontSize = Math.round(size * 0.32);
  ctx.font = `bold ${fontSize}px "AppleSDGothicNeo", Arial, sans-serif`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("하나", size / 2, size / 2);

  const buffer = canvas.toBuffer("image/png");
  writeFileSync(`public/icons/icon-${size}x${size}.png`, buffer);
  console.log(`Generated icon-${size}x${size}.png`);
}

console.log("Done.");
