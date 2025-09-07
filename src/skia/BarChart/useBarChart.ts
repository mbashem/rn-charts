import { useMemo, useState } from "react";
import { rect } from "@shopify/react-native-skia";
import { arrayFrom, isDefined } from "../../util/util";
import type { BarData, BarChartStyle } from "./BarChart";
import type { TooltipData } from "../Tooltip";
import { type GestureResponderEvent } from "react-native";
import { getFont, getPaddings } from "../common";

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
	const fontSize = style?.fontSize ?? 12;
	const font = getFont(fontSize);

	const chartWidth = chartBarSpacing * data.length + data.length * chartBarWidth;

	const rectangles = useMemo(() => {
		return data.map((bar, xIndex) => {
			let previousHeight = 0;
			const x = xIndex * (chartBarWidth + chartBarSpacing) + strokeWidth;
			return bar.values.map((item, yIndex) => {
				const barHeight =
					((item.value - minValueCalculated) /
						(maxValueCalculated - minValueCalculated)) *
					chartHeight;

				const y =
					chartHeight - barHeight - previousHeight - strokeWidth;

				previousHeight += barHeight;
				return rect(x, y, chartBarWidth, barHeight);
			});
		});
	}, [
		data,
		chartBarWidth,
		chartBarSpacing,
		maxValueCalculated,
		minValueCalculated,
		strokeWidth,
	]);

	const onCanvasTouchStart = (event: GestureResponderEvent) => {
		let leftExtraXSpace = strokeWidth;
		let xIndex = event.nativeEvent.locationX - leftExtraXSpace;
		xIndex = Math.floor(xIndex / (chartBarWidth + chartBarSpacing));
		let startingXIndex =
			xIndex * (chartBarWidth + chartBarSpacing) + leftExtraXSpace;

		if (startingXIndex + chartBarWidth < event.nativeEvent.locationX) {
			console.log('Touch is outside the bar width, ignoring.');
			setTooltip(undefined);
			return;
		}

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

		if (yIndex === 0) {
			setTooltip(undefined);
			return;
		}

		setTooltip({
			centerX: startingXIndex + chartBarWidth / 2,
			centerY:
				chartHeight - yPassed - strokeWidth + lastBarHeight / 2,
			label: categoryData[yIndex - 1]!.label || ' :u ',
		});
	};

	return {
		maxValueCalculated,
		minValueCalculated,
		canvasHeight,
		steps,
		chartWidth,
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
		fontSize,
		font,
		setTooltip,
		onCanvasTouchStart
	};
}
