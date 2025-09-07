import { Skia, type SkPath } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { getFont, getPaddings } from "../common";
import type { AreaChartStyle } from "./AreaChart";
import { isDefined } from "../../util/util";

export interface AreaData {
	values: number[];
	label?: string;
	color?: string;
}

export interface PathData {
	path: SkPath;
	color?: string;
	label?: string;
}

export interface XLable {
	label: string;
	xPosition: number;
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

	const fontSize = style?.fontSize ?? 12;
	const font = getFont(fontSize);

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
			console.log(width, areaData.length);

			const p = Skia.Path.Make();

			p.moveTo(0, areaCanvasHeight);

			areaData.forEach((y, i) => {
				const xPos = i * stepX;
				const yPos = areaCanvasHeight - ((y - minValueCalculated) / maxValueCalculated) * areaCanvasHeight;
				p.lineTo(xPos, Math.max(0, yPos));
			});

			p.lineTo(width, areaCanvasHeight);
			p.close();

			pathData.push({
				path: p,
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
				xPosition: i * stepX + fontSize,
			};
		});
		return labels;
	}, [xLabels, chartWidth]);

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
		font
	};
}

export default useAreaChart;