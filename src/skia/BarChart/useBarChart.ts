import { useMemo, useState } from "react";
import { rect } from "@shopify/react-native-skia";
import { arrayFrom, isDefined } from "../../util/util";
import type { BarData, BarChartStyle } from "./BarChart";
import type { TooltipData } from "../Tooltip";
import { useWindowDimensions, type GestureResponderEvent, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { getCommonStyleFont, getFont, getPaddings } from "../common";

export default function useBarChart(
	data: BarData[],
	style?: BarChartStyle,
	maxValue?: number,
	minValue?: number
) {
	const { maxValueCalculated, minValueCalculated } = useMemo(() => {
		if (isDefined(maxValue) && isDefined(minValue)) {
			return {
				maxValueCalculated: maxValue,
				minValueCalculated: minValue
			};
		}

		if (data.length === 0) {
			return { maxValueCalculated: maxValue ?? 100, minValueCalculated: minValue ?? 0 };
		}
		let maxValueCalculated = Number.MIN_VALUE;
		let minValueCalculated = Number.MAX_VALUE;

		data.forEach((item) => {
			const currentValue = item.values.reduce(
				(acc, value) => {
					minValueCalculated = Math.min(minValueCalculated, value.value);
					return acc + value.value;
				},
				0
			);
			maxValueCalculated = Math.max(maxValueCalculated, currentValue);
		});
		if (isDefined(maxValue))
			maxValueCalculated = maxValue;

		if (isDefined(minValue))
			minValueCalculated = minValue;

		return { maxValueCalculated, minValueCalculated };
	}, [data, maxValue]);

	const steps = useMemo(() => arrayFrom(1, 0.2), []);
	const [tooltip, setTooltip] = useState<TooltipData | undefined>(undefined);
	const [startX, setStartX] = useState<number>(0);

	const {
		paddingLeft,
		paddingRight,
		paddingTop,
		paddingBottom
	} = getPaddings(style);

	const chartBarWidth = style?.barWidth ?? 100;
	const chartBarSpacing = style?.barSpacing ?? 0;
	const verticalLabelWidth = 35;
	const chartHeight = style?.height ?? 200;
	const strokeWidth = 2;
	const bottomLabelHeight = 20;
	const canvasHeight = chartHeight + bottomLabelHeight;
	const { width: windowWidth } = useWindowDimensions();
	const width = style?.width ?? windowWidth;

	const scrollAreaWidth = data.length * (chartBarWidth + chartBarSpacing);
	const canvasWidth = Math.min(scrollAreaWidth, width - verticalLabelWidth - paddingRight - paddingLeft);
	const { font } = getCommonStyleFont(style);


	const rectangles = useMemo(() => {
		let leftBoundary = Math.max(0, startX);
		let rightBoundary = startX + width;

		let startArrayIndex = Math.floor(leftBoundary / (chartBarWidth + chartBarSpacing));
		let endArrayIndex = Math.min(Math.ceil(rightBoundary / (chartBarWidth + chartBarSpacing)), data.length);

		return data.slice(startArrayIndex, endArrayIndex)
			.map((bar, xIndex) => {
				let previousHeight = 0;
				const x = (xIndex + startArrayIndex) * (chartBarWidth + chartBarSpacing) - leftBoundary;
				return {
					bars: bar.values.map((item, yIndex) => {
						const barHeight =
							((item.value - minValueCalculated) /
								(maxValueCalculated - minValueCalculated)) *
							chartHeight;

						const y =
							chartHeight - barHeight - previousHeight - strokeWidth;

						previousHeight += barHeight;
						return rect(x, y, chartBarWidth, barHeight);
					}),
					label: bar.label,
					dataIndex: xIndex + startArrayIndex,
					x: x
				};
			});
	}, [
		data,
		chartBarWidth,
		chartBarSpacing,
		maxValueCalculated,
		minValueCalculated,
		strokeWidth,
		startX
	]);

	const onCanvasTouchStart = (event: GestureResponderEvent) => {
		if (rectangles.length === 0) {
			setTooltip(undefined);
			return;
		}

		const touchedX = event.nativeEvent.locationX;
		let xIndex = -1;
		let startingXIndex = 0;

		if (touchedX >= rectangles[0]!.x && touchedX <= rectangles[0]!.x + rectangles[0]!.bars[0]!.width) {
			xIndex = 0;
			startingXIndex = Math.max(0, rectangles[0]!.x);
		} else if (touchedX >= rectangles[0]!.x) {
			xIndex = Math.floor((touchedX - (rectangles[0]!.x + rectangles[0]!.bars[0]!.width) - chartBarSpacing) / (chartBarWidth + chartBarSpacing)) + 1;
			startingXIndex = rectangles[xIndex]!.x;
		}

		if (xIndex === -1 || (touchedX < rectangles[xIndex]!.x || touchedX > rectangles[xIndex]!.x + chartBarWidth)) {
			console.log('Touch is outside the bar width, ignoring.');
			setTooltip(undefined);
			return;
		}
		xIndex = rectangles[xIndex]!.dataIndex;

		const touchedY = event.nativeEvent.locationY;
		let yIndex = 0;
		let yPassed = 0;
		let categoryData = data[xIndex]?.values || [];
		let lastBarHeight = 0;

		while (
			yIndex < categoryData.length &&
			yPassed < chartHeight - event.nativeEvent.locationY
		) {
			const barHeight =
				((categoryData[yIndex]!.value - minValueCalculated) /
					(maxValueCalculated - minValueCalculated)) *
				chartHeight;
			yPassed += barHeight;
			lastBarHeight = barHeight;
			yIndex++;
		}
		
		if (yIndex === 0 || (yIndex === categoryData.length && touchedY < chartHeight - yPassed)) {
			console.log('Touch is outside the bar height, ignoring.');
			setTooltip(undefined);
			return;
		}

		setTooltip({
			centerX: startingXIndex + chartBarWidth / 2,
			centerY:
				chartHeight - yPassed - strokeWidth + lastBarHeight / 2,
			label: categoryData[yIndex - 1]!.label,
		});
	};

	function onScroll(translateX: number) {
		setTooltip(undefined);
		setStartX((prev) => {
			let newX = prev + translateX;
			if (newX < 0) return 0;
			if (newX + canvasWidth > scrollAreaWidth)
				return Math.max(0, scrollAreaWidth - canvasWidth);
			return newX;
		});
	}

	return {
		maxValueCalculated,
		minValueCalculated,
		canvasHeight,
		canvasWidth,
		steps,
		scrollAreaWidth,
		chartHeight,
		paddingTop,
		paddingBottom,
		paddingLeft,
		paddingRight,
		verticalLabelWidth,
		chartBarWidth,
		chartBarSpacing,
		strokeWidth,
		rectangles,
		tooltip,
		bottomLabelHeight,
		font,
		setTooltip,
		onCanvasTouchStart,
		onScroll
	};
}
