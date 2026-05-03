import { I18nManager } from "react-native";

export interface CommonStyle {
	padding?: number;
	paddingTop?: number;
	paddingBottom?: number;
	paddingStart?: number;
	paddingEnd?: number;
	paddingLeft?: number;
	paddingRight?: number;
	paddingHorizontal?: number;
	paddingVertical?: number;
	backgroundColor?: string;
	disableRTL?: boolean;
}

export function getPaddings(style?: CommonStyle) {
	const paddingTop = style?.paddingTop ?? style?.padding ?? 0;
	const paddingBottom = style?.paddingBottom ?? style?.padding ?? 0;
	const isRTL = I18nManager.isRTL && !(style?.disableRTL ?? false)

	const paddingLeft = style?.paddingHorizontal ?? style?.paddingLeft ?? (isRTL ? style?.paddingEnd : style?.paddingStart) ?? style?.padding ?? 0;
	const paddingRight = style?.paddingVertical ?? style?.paddingRight ?? (isRTL ? style?.paddingStart : style?.paddingEnd) ?? style?.padding ?? 0;
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

export interface HandleOutSideTouch {
  touchedOutside: () => void;
}