import { listFontFamilies, matchFont, Skia, TextAlign, type SkFont, type SkParagraph, type SkTextStyle } from "@shopify/react-native-skia";
import { Platform } from "react-native";

export interface CommonStyle {
	padding?: number;
	paddingTop?: number;
	paddingBottom?: number;
	paddingStart?: number;
	paddingEnd?: number;
	paddingLeft?: number;
	paddingRight?: number;
	backgroundColor?: string;
	disableRTL?: boolean;
	font?: SkFont;
	fontSize?: number;
}

export function getCommonStyleFont(style?: CommonStyle) {
	const fontSize = style?.font?.getSize() ?? style?.fontSize ?? 12;
	const font = style?.font ?? getFont(fontSize);
	return { font, fontSize };
}

export function getPaddings(style?: CommonStyle) {
	const paddingTop = style?.paddingTop ?? style?.padding ?? 0;
	const paddingBottom = style?.paddingBottom ?? style?.padding ?? 0;
	const paddingLeft = style?.paddingLeft ?? style?.paddingStart ?? style?.padding ?? 0;
	const paddingRight = style?.paddingRight ?? style?.paddingEnd ?? style?.padding ?? 0;
	const paddingHorizontal = paddingLeft + paddingRight;
	const paddingVertical = paddingTop + paddingBottom;

	return {
		paddingTop,
		paddingBottom,
		paddingLeft,
		paddingRight,
		paddingHorizontal,
		paddingVertical
	};
}

export function getRandomRGBColor() {
	const r = Math.floor(Math.random() * 256);
	const g = Math.floor(Math.random() * 256);
	const b = Math.floor(Math.random() * 256);
	return `rgb(${r},${g},${b})`;
};

export const systemFontFamilies = Platform.select({
	ios: ["Helvetica", "Arial", "Courier"],
	android: ["roboto-flex", "sans-serif", "Roboto", "serif", "monospace"],
	default: ["sans-serif", "serif"],
});

export function getFont(size: number = 14): SkFont {
	const fontFamily = systemFontFamilies[0];
	// console.log("Available system font families:", listFontFamilies());
	// console.log("Using font family:", fontFamily, systemFontFamilies);
	const font = matchFont({
		fontFamily,
		fontSize: size,
		fontStyle: "normal",
		fontWeight: "normal",
	});
	return font;
}

export const font = getFont();

function createParagraph(text: string): SkParagraph {
	const paragraphStyle = {
		textAlign: TextAlign.Center,
	};

	const fontStyle: SkTextStyle = {
		fontFamilies: systemFontFamilies,
		fontSize: 14,
	};
	const paragraph = Skia.ParagraphBuilder.Make(paragraphStyle).pushStyle(fontStyle).addText(text).pop().build();

	return paragraph;
}
