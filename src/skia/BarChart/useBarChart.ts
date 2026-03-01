import { useMemo, useState } from "react";
import { rect, type SkHostRect } from "@shopify/react-native-skia";
import { arrayFrom, isDefined } from "../../util/util";
import type { StackValue, BarChartProps } from "./BarChart";
import { useWindowDimensions } from "react-native";
import { getPaddings } from "../common";
import { useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export default function useBarChart(
	{
		data,
		style,
		maxValue,
		minValue,
		yLabels,
		overscanRatio
	}: BarChartProps
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
	const [tooltip, setTooltip] = useState<{ centerX: number, centerY: number, rect: SkHostRect, data: StackValue, xLabel?: string; } | undefined>(undefined);
	const [startX, setStartX] = useState<number>(0);

	const {
		paddingLeft,
		paddingRight,
		paddingTop,
		paddingBottom
	} = getPaddings(style);

	const chartBarWidth = style?.barWidth ?? 100;
	const chartBarSpacing = style?.barSpacing ?? 0;

	const [verticalLabelWidth, setVerticalLabelWidth] = useState(style?.verticalLabelStyle?.width ?? 0);
	const chartHeight = style?.height ?? 200;
	const verticalStrokeWidth = style?.verticalLabelStyle?.strokeWidth ?? 0;
	const horizontalStrokeWidth = style?.horizontalLabelStyle?.strokeWidth ?? 0;
	const [bottomLabelHeight, setBottomLabelHeight] = useState(20);
	const { width: windowWidth } = useWindowDimensions();
	const totalWidth = style?.width ?? windowWidth;
	const totalHeight = chartHeight;

	const initialSpacing = style?.firstBarLeadingSpacing ?? 0;
	const endSpacing = style?.lastBarTrailingSpacing ?? chartBarSpacing;

	const scrollAreaWidth = initialSpacing + data.length * chartBarWidth + (Math.max(0, data.length - 1) * chartBarSpacing) + endSpacing;
	const canvasWidth = Math.min(scrollAreaWidth, totalWidth - verticalLabelWidth - paddingRight - paddingLeft);
	const overscanArea = totalWidth * (overscanRatio ?? 0.5);
	const leftBoundary = startX - overscanArea;

	const rectangles = useMemo(() => {
		let rightBoundary = startX + totalWidth + overscanArea;

		let startArrayIndex = Math.floor(Math.max(leftBoundary - initialSpacing, 0) / (chartBarWidth + chartBarSpacing));
		let endArrayIndex = Math.min(Math.ceil(rightBoundary / (chartBarWidth + chartBarSpacing)), data.length);

		return data.slice(startArrayIndex, endArrayIndex)
			.map((bar, xIndex) => {
				let previousHeight = 0;
				const x = initialSpacing + (xIndex + startArrayIndex) * (chartBarWidth + chartBarSpacing);
				return {
					bars: bar.values.map((item, yIndex) => {
						const barHeight =
							((item.value - minValueCalculated) /
								Math.max(maxValueCalculated - minValueCalculated, 1)) *
							chartHeight;

						const y =
							chartHeight - barHeight - previousHeight;

						previousHeight += barHeight;
						return { rect: rect(x, y, chartBarWidth, barHeight), stackValue: item };
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
		startX
	]);

	const touchHandler = (touchedX: number, touchedY: number) => {
		if (rectangles.length === 0 || touchedX < 0 || touchedY < 0 || touchedX >= canvasWidth || touchedY >= chartHeight) {
			setTooltip(undefined);
			return;
		}

		let firstX = rectangles[0]!.x - startX
		let spaceBetween = touchedX - firstX
		if(spaceBetween < 0) {
			setTooltip(undefined);
			return;
		}

		let xIndex = Math.floor(spaceBetween / (chartBarWidth + chartBarSpacing));
		let startingXIndex = rectangles[xIndex]!.x - startX;

		if (xIndex === -1 || (touchedX < rectangles[xIndex]!.x - startX|| touchedX > rectangles[xIndex]!.x - startX + chartBarWidth)) {
			console.log('Touch is outside the bar width, ignoring.', xIndex);
			setTooltip(undefined);
			return;
		}
		xIndex = rectangles[xIndex]!.dataIndex;

		let yIndex = 0;
		let yPassed = 0;
		let categoryData = data[xIndex]?.values || [];
		let lastBarHeight = 0;

		while (
			yIndex < categoryData.length &&
			yPassed < chartHeight - touchedY
		) {
			const barHeight =
				((categoryData[yIndex]!.value - minValueCalculated) /
					Math.max(maxValueCalculated - minValueCalculated, 1)) *
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
			centerX: startingXIndex + verticalLabelWidth + paddingLeft + chartBarWidth / 2,
			centerY:
				chartHeight - yPassed + paddingTop + lastBarHeight / 2,
			rect: rect(startingXIndex, chartHeight - yPassed, chartBarWidth, lastBarHeight),
			data: categoryData[yIndex - 1]!,
			xLabel: data[xIndex]?.label
		});
	};

	const offset = useSharedValue(0);

	function onScroll(translateX: number) {
		'worklet';
		let prev = offset.value;
		let newX = Math.max(0, prev + translateX);
		if (newX + canvasWidth > scrollAreaWidth)
			newX = Math.max(0, scrollAreaWidth - canvasWidth);
		offset.set(newX);
		scheduleOnRN(setTooltip, undefined);
		scheduleOnRN(setStartX, newX);
	}

	return {
		offset,
		maxValueCalculated,
		minValueCalculated,
		canvasWidth,
		steps,
		scrollAreaWidth,
		chartHeight,
		paddingTop,
		paddingBottom,
		paddingLeft,
		paddingRight,
		verticalLabelWidth,
		setVerticalLabelWidth,
		chartBarWidth,
		chartBarSpacing,
		rectangles,
		tooltip,
		bottomLabelHeight,
		setBottomLabelHeight,
		setTooltip,
		touchHandler,
		onScroll,
		startX,
		totalHeight,
		totalWidth,
		yLabels,
		verticalStrokeWidth,
		horizontalStrokeWidth
	};
}
