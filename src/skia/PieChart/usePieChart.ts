import { useMemo, useState } from "react";
import type { PieChartProps, PieChartStyles, PieSlice, PopupData } from "./PieChart";
import { rect, rrect, Skia } from "@shopify/react-native-skia";
import { getRandomRGBColor } from "../common";

function degreesToRadians(degrees: number): number {
	return (degrees * Math.PI) / 180;
}

function ypoint(angle: number, radius: number, cy: number): number {
	return cy - radius * Math.sin(degreesToRadians(angle));
}

function xpoint(angle: number, radius: number, cx: number): number {
	return cx - radius * Math.cos(degreesToRadians(angle));
}

function getCircularPoints(
	startAngle: number,
	radius: number,
	angle: number,
	cx: number,
	cy: number
): [number, number, number, number] {
	let x1 = xpoint(startAngle, radius, cx);
	let y1 = ypoint(startAngle, radius, cy);
	let x2 = xpoint(startAngle + angle, radius, cx);
	let y2 = ypoint(startAngle + angle, radius, cy);

	return [x1, y1, x2, y2];
}

export function usePieChart({
	slices,
	style,
	onSliceTouch
}: PieChartProps
) {
	const [popupData, setPopupData] = useState<PopupData | undefined>(undefined);

	const radius = style.radius ?? 150;
	const diameter = radius * 2;
	const innerRadius = style.innerRadius ?? 100;
	const interSliceGap = style.interSliceGap ?? 20;
	const cx = radius;
	const cy = radius;


	let startAngle = 0;

	const { paths, total } = useMemo(() => {
		const total = slices.reduce((sum, slice) => sum + slice.value, 0);

		const paths = slices.map(({ value, color }, index) => {
			let rounded = style?.roundedSlice ?? false;
			const sweepAngleTobeAdded = (value / total) * 360;
			let currentStartAngle = startAngle;
			let sweepAngle = sweepAngleTobeAdded;
			startAngle += sweepAngleTobeAdded;

			const sliceThickness = radius - innerRadius;
			const midRadius = (radius + innerRadius) / 2;
			const middleCircleLength = 2 * Math.PI * midRadius;
			let angleReductionForGap = !interSliceGap ? 0 : (interSliceGap / middleCircleLength) * 360;
			let angleReductionForRounding = !rounded ? 0 : (sliceThickness / middleCircleLength) * 360;

			let angleReduction = angleReductionForGap + angleReductionForRounding;
			currentStartAngle += angleReduction / 2;;
			sweepAngle -= angleReduction;

			let [x1, y1, x2, y2] = getCircularPoints(
				currentStartAngle,
				radius,
				sweepAngle,
				cx,
				cy
			);
			let [cx1, cy1, cx2, cy2] = getCircularPoints(
				currentStartAngle,
				innerRadius,
				sweepAngle,
				cx,
				cy
			);

			let path = Skia.Path.Make();

			if (rounded) {
				let capStartX = (x1 + cx1) / 2 - sliceThickness / 2;
				let capStartY = (y1 + cy1) / 2 - sliceThickness / 2;

				const sliceRadius = sliceThickness / 2;

				path.addRRect(rrect(rect(capStartX, capStartY, sliceThickness, sliceThickness), sliceRadius, sliceRadius));
			}

			path.addArc(
				rect(
					cx - radius,
					cy - radius,
					radius * 2,
					radius * 2
				),
				currentStartAngle + 180,
				sweepAngle
			);
			path.lineTo(cx2, cy2);

			path.addArc(
				rect(
					cx - innerRadius,
					cy - innerRadius,
					innerRadius * 2,
					innerRadius * 2
				),
				currentStartAngle + 180 + sweepAngle,
				-sweepAngle
			);

			path.lineTo(x1, y1);
			if (rounded) {
				let capEndX = (x2 + cx2) / 2 - sliceThickness / 2;
				let capEndY = (y2 + cy2) / 2 - sliceThickness / 2;

				const sliceRadius = sliceThickness / 2;
				path.addRRect(rrect(rect(capEndX, capEndY, sliceThickness, sliceThickness), sliceRadius, sliceRadius));
			}
			path.close();
			return { path, color: color ?? getRandomRGBColor() };
		});
		return { paths, total };
	}, [
		slices,
		style?.roundedSlice,
		radius,
		innerRadius,
		interSliceGap,
		cx,
		cy
	]);

	const touchHandler = (locationX: number, locationY: number) => {
		if (!onSliceTouch || locationX < 0 || locationY < 0 || locationX >= diameter || locationY >= diameter) {
			setPopupData(undefined);
			return;
		}

		let foundPath = false;
		let angles = 0;

		paths.forEach(({ path }, index) => {
			let slice = slices[index];
			if (!slice) return;

			let lastAngle = (slice.value / total) * 360;
			if (path.contains(locationX, locationY)) {
				const label = slice.label || 'Slice';

				const outerX = xpoint(angles + lastAngle / 2, radius, cx);
				const innerX = xpoint(angles + lastAngle / 2, innerRadius, cx);

				const outerY = ypoint(angles + lastAngle / 2, radius, cy);
				const innerY = ypoint(angles + lastAngle / 2, innerRadius, cy);

				const centerY = (outerY + innerY) / 2;
				const centerX = (outerX + innerX) / 2;

				onSliceTouch?.(slice);
				setPopupData({
					centerX: centerX,
					centerY: centerY,
					data: slice,
				});

				foundPath = true;
				return;
			}

			angles += lastAngle;
		});

		if (!foundPath) {
			console.log('No slice found at touch location');
			onSliceTouch?.(undefined);
			setPopupData(undefined);
		}
	};
	return {
		paths,
		diameter,
		innerRadius,
		radius,
		popupData,
		touchHandler,
	};
}