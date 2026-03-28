import { useMemo, useState } from "react";
import type { PieChartProps, PopupData } from "./PieChart";
import { rect, Skia, type SkPath } from "@shopify/react-native-skia";
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

function pdist(px: number, py: number, cx: number, cy: number) {
	return Math.hypot(px - cx, py - cy);
}

type Point = { x: number, y: number; };

// FIXME: Faulty logic to calculate the corner points for rounded slices, needs to be fixed
function corners(x1: number, y1: number, x2: number, y2: number, r: number, cx: number, cy: number, nearest: boolean) {
	const dx = x2 - x1;
	const dy = y2 - y1;

	const d = pdist(x1, y1, x2, y2);

	// ❗ must satisfy
	if (d > 2 * r) {
		// no valid circle possible
		throw new Error("Invalid points");
	}

	// midpoint
	const mx = (x1 + x2) / 2;
	const my = (y1 + y2) / 2;

	// perpendicular unit vector
	const ux = -dy / d;
	const uy = dx / d;

	// distance from midpoint to center
	const h = Math.sqrt(r * r - (d / 2) * (d / 2));

	// two possible centers
	const cxA = mx + ux * h;
	const cyA = my + uy * h;

	const cxB = mx - ux * h;
	const cyB = my - uy * h;

	let nearestPoint: Point = { x: cxA, y: cyA };
	let distantPoint: Point = { x: cxB, y: cyB };
	if (pdist(nearestPoint.x, nearestPoint.y, cx, cy) > pdist(distantPoint.x, distantPoint.y, cx, cy)) {
		let temp = nearestPoint;
		nearestPoint = distantPoint;
		distantPoint = temp;
	}

	if (nearest) return nearestPoint;

	return distantPoint;
}

function angle(cx: number, cy: number, x: number, y: number) {
	return (Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 360) % 360;
}

function arcFromCenter(
	path: SkPath,
	cx: number,
	cy: number,
	r: number,
	startX: number,
	startY: number,
	endX: number,
	endY: number,
	sweepAngle: number = 90,
	isCCW: boolean = false
) {
	let startAngle = angle(cx, cy, startX, startY);
	let endAngle = angle(cx, cy, endX, endY);
	if (isCCW) {
		[startAngle, endAngle] = [endAngle, startAngle];
	}

	let angleDiff = (endAngle - startAngle + 360) % 360;
	if (angleDiff !== sweepAngle) {
		console.warn(`Expected sweep angle of ${sweepAngle} but got ${endAngle - startAngle}, startAngle: ${startAngle}, endAngle: ${endAngle}`);
	}

	path.addArc(
		rect(cx - r, cy - r, r * 2, r * 2),
		startAngle,
		angleDiff
	);
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
	const width = diameter + 30;
	const height = width;
	const innerRadius = style.innerRadius ?? 100;
	const interSliceGap = style.interSliceGap ?? 20;
	const cx = width / 2;
	const cy = height / 2;

	const { paths, total } = useMemo(() => {
		const total = slices.reduce((sum, slice) => sum + slice.value, 0);
		let startAngle = 0;

		const paths = slices.map(({ value, color, radius: roundRadius = 0 }, index) => {
			const sweepAngleTobeAdded = (value / total) * 360;
			let currentStartAngle = startAngle;
			let sweepAngle = sweepAngleTobeAdded;
			startAngle += sweepAngleTobeAdded;

			const outerCircleLength = 2 * Math.PI * radius;

			let angleReductionForGap = !interSliceGap ? 0 : (interSliceGap / outerCircleLength) * 360;
			let angleReductionForRounding = (roundRadius / outerCircleLength) * 360 * 2;

			currentStartAngle += angleReductionForGap / 2;
			sweepAngle -= angleReductionForGap;

			const boundaryCircleStartingAngle = currentStartAngle + angleReductionForRounding / 2;
			const boundaryCircleSweepAngle = sweepAngle - angleReductionForRounding;

			// Outer Circle
			let [x1, y1, x2, y2] = getCircularPoints(
				boundaryCircleStartingAngle,
				radius,
				boundaryCircleSweepAngle,
				cx,
				cy
			);

			// FIXME: Probable corner point. Need to find accurate way to calulate corner for rounding
			// let [cx1, cy1, cx2, cy2] = getCircularPoints(
			// 	currentStartAngle,
			// 	radius,
			// 	sweepAngle,
			// 	cx,
			// 	cy
			// );

			let [rx1, ry1, rx2, ry2] = getCircularPoints(
				currentStartAngle,
				radius - roundRadius,
				sweepAngle,
				cx,
				cy
			);

			// Inner circle
			let [ix1, iy1, ix2, iy2] = getCircularPoints(
				boundaryCircleStartingAngle,
				innerRadius,
				boundaryCircleSweepAngle,
				cx,
				cy
			);

			// FIXME: Probable corner point. Need to find accurate way to calulate corner for rounding
			// let [cix1, ciy1, cix2, ciy2] = getCircularPoints(
			// 	currentStartAngle,
			// 	innerRadius,
			// 	sweepAngle,
			// 	cx,
			// 	cy
			// );
			let [rix1, riy1, rix2, riy2] = getCircularPoints(
				currentStartAngle,
				innerRadius + roundRadius,
				sweepAngle,
				cx,
				cy
			);

			let path = Skia.Path.Make();

			const cornerPoint1 = corners(x2, y2, rx2, ry2, roundRadius, cx, cy, true);

			arcFromCenter(path, cornerPoint1.x, cornerPoint1.y, roundRadius, x2, y2, rx2, ry2);

			path.lineTo(rix2, riy2);

			const cornerPoint2 = corners(rix2, riy2, ix2, iy2, roundRadius, cx, cy, false);
			arcFromCenter(path, cornerPoint2.x, cornerPoint2.y, roundRadius, rix2, riy2, ix2, iy2);
			path.lineTo(x2, y2);

			path.addArc(
				rect(
					cx - radius,
					cy - radius,
					radius * 2,
					radius * 2
				),
				boundaryCircleStartingAngle + 180,
				boundaryCircleSweepAngle
			);

			path.lineTo(ix2, iy2);

			path.addArc(
				rect(
					cx - innerRadius,
					cy - innerRadius,
					innerRadius * 2,
					innerRadius * 2
				),
				boundaryCircleStartingAngle + 180 + boundaryCircleSweepAngle,
				-boundaryCircleSweepAngle
			);
			path.lineTo(x1, y1);

			const cornerPoint3 = corners(ix1, iy1, rix1, riy1, roundRadius, cx, cy, false);
			arcFromCenter(path, cornerPoint3.x, cornerPoint3.y, roundRadius, ix1, iy1, rix1, riy1);

			path.lineTo(rx1, ry1);

			const cornerPoint4 = corners(rx1, ry1, x1, y1, roundRadius, cx, cy, true);
			arcFromCenter(path, cornerPoint4.x, cornerPoint4.y, roundRadius, rx1, ry1, x1, y1);
			path.lineTo(ix1, iy1);

			path.close();
			return { path, color: color ?? getRandomRGBColor() };
		});
		return { paths, total };
	}, [
		slices,
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
		height,
		width,
		diameter,
		innerRadius,
		radius,
		popupData,
		touchHandler,
		cx,
		cy
	};
}