import { Skia, type SkPath } from "@shopify/react-native-skia";
import { useMemo, useState } from "react";
import { getCommonStyleFont, getFont, getPaddings } from "../common";
import type { AreaChartStyle } from "./AreaChart";
import { isDefined } from "../../util/util";
import type { GestureResponderEvent } from "react-native";

export interface AreaData {
	values: number[];
	label?: string;
	color?: string;
}

interface Point {
	x: number;
	y: number;
}

export interface PathData {
	path: SkPath;
	points: Point[];
	color?: string;
	label?: string;
}

export interface XLable {
	label: string;
	xPosition: number;
}

interface TouchLine {
  x: number;
  y: number[];
}

function useAreaChart(
	data: AreaData[],
	xLabels?: string[],
	maxValue?: number,
	minValue?: number,
	style?: AreaChartStyle,
) {

	const height = style?.height ?? 200;
	const width = style?.width ?? 200;
	const {
		paddingHorizontal,
		paddingVertical,
	} = getPaddings(style);

	const canvasHeight = height - paddingVertical;
	const labelWidth = 30;
	const chartWidth = width - labelWidth - paddingHorizontal;
	const xLabelHeight = xLabels && xLabels.length > 0 ? (style?.fontSize ?? 12) + 5 : 0;
	const areaCanvasHeight = canvasHeight - xLabelHeight;

	const { font } = getCommonStyleFont(style);

	const { maxValueCalculated, minValueCalculated } = useMemo(() => {
		if (isDefined(maxValue) && isDefined(minValue)) {
			return { maxValueCalculated: maxValue, minValueCalculated: minValue };
		}
		let maxValueCalculated = Number.MIN_VALUE;
		let minValueCalculated = Number.MAX_VALUE;

		data.forEach((datum) => {
			datum.values.forEach((value) => {
				if (value > maxValueCalculated && !isDefined(maxValue)) {
					maxValueCalculated = value;
				}
				if (value < minValueCalculated && !isDefined(minValue)) {
					minValueCalculated = value;
				}
			});
		});

		return { maxValueCalculated, minValueCalculated };
	}, [data]);

	const paths = useMemo(() => {
		const pathData: PathData[] = [];
		for (let datum of data) {
			const areaData = datum.values;
			const stepX = width / areaData.length;

			const p = Skia.Path.Make();

			p.moveTo(0, areaCanvasHeight);
			const points: Point[] = [];

			areaData.forEach((y, i) => {
				const xPos = i * stepX;
				const yPos = Math.max(0, areaCanvasHeight - ((y - minValueCalculated) / (maxValueCalculated - minValueCalculated)) * areaCanvasHeight);

				points.push({x: xPos, y: yPos});
				p.lineTo(xPos, yPos);
			});

			p.lineTo(width, areaCanvasHeight);
			p.close();

			pathData.push({
				path: p,
				points,
				color: datum.color,
				label: datum.label,
			});
		}

		return pathData;
	}, [data, maxValueCalculated, minValueCalculated]);

	const xLabelsData: XLable[] = useMemo(() => {
		if (!xLabels || xLabels.length === 0) {
			return [];
		}

		const stepX = chartWidth / xLabels.length;
		const labels = xLabels.map((label, i) => {
			return {
				label,
				xPosition: i * stepX + font.getSize(),
			};
		});
		return labels;
	}, [xLabels, chartWidth]);

	const [touchLine, setTouchLine] = useState<TouchLine | undefined>(undefined);

	const onCanvasTouchStart = (event: GestureResponderEvent) => {
		const xIndex = event.nativeEvent.locationX;
		const yIndex = event.nativeEvent.locationY;

		// setTouchLine({
		// 	x: xIndex,
		// });
	};

	return {
		paths,
		chartWidth,
		canvasHeight,
		areaCanvasHeight,
		labelWidth,
		maxValue: maxValueCalculated,
		minValue: minValueCalculated,
		xLabelsData,
		xLabelHeight,
		font,
		onCanvasTouchStart,
		touchLine
	};
}

export default useAreaChart;