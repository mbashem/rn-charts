"use strict";

import { listFontFamilies, matchFont, Skia, TextAlign } from "@shopify/react-native-skia";
import { Platform } from "react-native";
export function getRandomRGBColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
}
;
export const systemFontFamilies = Platform.select({
  ios: ["Helvetica", "Arial", "Courier"],
  android: ["roboto-flex", "sans-serif", "Roboto", "serif", "monospace"],
  default: ["sans-serif", "serif"]
});
function getFont() {
  const fontFamily = systemFontFamilies[0];
  console.log("Available system font families:", listFontFamilies());
  console.log("Using font family:", fontFamily, systemFontFamilies);
  const font = matchFont({
    fontFamily,
    fontSize: 14,
    fontStyle: "normal",
    fontWeight: "normal"
  });
  return font;
}
export const font = getFont();
function createParagraph(text) {
  const paragraphStyle = {
    textAlign: TextAlign.Center
  };
  const fontStyle = {
    fontFamilies: systemFontFamilies,
    fontSize: 14
  };
  const paragraph = Skia.ParagraphBuilder.Make(paragraphStyle).pushStyle(fontStyle).addText(text).pop().build();
  return paragraph;
}
//# sourceMappingURL=common.js.map