import { useMemo, useState } from "react";
import { rect } from "@shopify/react-native-skia";
import { arrayFrom, isDefined } from "../../util/util";
import type { BarData, BarChartStyle } from "./BarChart";
import type { TooltipData } from "../Tooltip";
import { type GestureResponderEvent } from "react-native";

export default function useBarChart(
	data: BarData[],
	style?: BarChartStyle,
	maxValue?: number,
	minValue?: number
) {
	const { maxValueCalculated } = useMemo(() => {
		if (isDefined(maxValue)) {
			return {
				maxValueCalculated: maxValue,
			};
		}

		if (data.length === 0) {
			return { maxValueCalculated: 100 };
		}
		let maxValueCalculated = Number.MIN_VALUE;

		data.forEach((item) => {
			const currentValue = item.values.reduce(
				(acc, value) => acc + value.value,
				0
			);
			maxValueCalculated = Math.max(maxValueCalculated, currentValue);
		});

		return { maxValueCalculated };
	}, [data, maxValue]);

	const minValueCalculated = minValue ?? 0;
	const steps = useMemo(() => arrayFrom(1, 0.2), []);
	const [tooltip, setTooltip] = useState<TooltipData | undefined>(undefined);

	const paddingRight = style?.paddingRight ?? style?.padding ?? 10;
	const paddingLeft = style?.paddingLeft ?? style?.padding ?? 10;
	const chartBarWidth = style?.barWidth ?? 100;
	const chartBarSpacing = style?.spacing ?? 20;
	const verticalLabelSpace = 40;
	const chartHeight = style?.height ?? 200;
	const paddingBottom = 30;
	const paddingTop = 10;
	const strokeWidth = 2;

	const chartWidth = useMemo(() => {
		if (isDefined(style?.width)) return style.width;

		return chartBarSpacing * data.length + data.length * chartBarWidth + paddingRight;
	}, [style?.width, data.length, chartBarSpacing, chartBarWidth, paddingRight]);

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
					chartHeight - barHeight - previousHeight + paddingTop - strokeWidth;

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
		paddingTop,
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
			yPassed < chartHeight - event.nativeEvent.locationY + paddingTop
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
				chartHeight - yPassed + paddingTop - strokeWidth + lastBarHeight / 2,
			label: categoryData[yIndex - 1]!.label || ' :u ',
		});
	};

	return {
		maxValueCalculated,
		minValueCalculated,
		steps,
		chartWidth,
		chartHeight,
		paddingTop,
		paddingBottom,
		paddingLeft,
		paddingRight,
		verticalLabelSpace,
		chartBarWidth,
		chartBarSpacing,
		strokeWidth,
		rectangles,
		tooltip,
		setTooltip,
		onCanvasTouchStart
	};
}
