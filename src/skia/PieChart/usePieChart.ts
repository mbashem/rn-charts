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

type Point = { x: number; y: number; };

function euclideanDistance(dx: number, dy: number) {
	return Math.hypot(dx, dy);
}

function getProportionPoint(
	point: Point,
	segment: number,
	length: number,
	dx: number,
	dy: number
): Point {
	const factor = segment / length;

	return {
		x: point.x - dx * factor,
		y: point.y - dy * factor,
	};
}

function angle(cx: number, cy: number, x: number, y: number) {
	return (Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 360) % 360;
}

// https://stackoverflow.com/a/24780108/13509919
function drawRoundedCorner(
	path: SkPath,
	angularPoint: Point,
	p1: Point,
	p2: Point,
	radius: number
) {
	// Vector 1
	const dx1 = angularPoint.x - p1.x;
	const dy1 = angularPoint.y - p1.y;

	// Vector 2
	const dx2 = angularPoint.x - p2.x;
	const dy2 = angularPoint.y - p2.y;

	// Angle / 2
	let angleHalf =
		(Math.atan2(dy1, dx1) - Math.atan2(dy2, dx2)) / 2;

	const tan = Math.abs(Math.tan(angleHalf));
	if (tan === 0) return;

	let segment = radius / tan;

	// Lengths
	const length1 = euclideanDistance(dx1, dy1);
	const length2 = euclideanDistance(dx2, dy2);

	const length = Math.min(length1, length2);

	// Clamp
	if (segment > length) {
		segment = length;
		radius = length * tan;
	}

	// Trimmed points
	const p1Cross = getProportionPoint(
		angularPoint,
		segment,
		length1,
		dx1,
		dy1
	);

	const p2Cross = getProportionPoint(
		angularPoint,
		segment,
		length2,
		dx2,
		dy2
	);

	// Circle center
	const dx = angularPoint.x * 2 - p1Cross.x - p2Cross.x;
	const dy = angularPoint.y * 2 - p1Cross.y - p2Cross.y;

	const L = euclideanDistance(dx, dy);
	const d = Math.hypot(segment, radius);

	const circlePoint = getProportionPoint(
		angularPoint,
		d,
		L,
		dx,
		dy
	);

	// Angles (degrees for Skia)
	let startAngle = angle(
		circlePoint.x,
		circlePoint.y,
		p1Cross.x,
		p1Cross.y
	);

	let endAngle = angle(
		circlePoint.x,
		circlePoint.y,
		p2Cross.x,
		p2Cross.y
	);

	let sweepAngle = endAngle - startAngle;

	// Normalize
	if (sweepAngle < 0) {
		const temp = startAngle;
		startAngle = endAngle;
		sweepAngle = temp - endAngle;
	}

	if (sweepAngle > 180) {
		sweepAngle = 180 - sweepAngle;
	}

	path.moveTo(p1Cross.x, p1Cross.y);

	// arc
	path.addArc(
		rect(
			circlePoint.x - radius,
			circlePoint.y - radius,
			radius * 2,
			radius * 2
		),
		startAngle,
		sweepAngle
	);
	path.lineTo(p1Cross.x, p1Cross.y);
	path.close();

	drawLines(path, [
		{ x: p1.x, y: p1.y },
		{ x: p1Cross.x, y: p1Cross.y },
		{ x: p2Cross.x, y: p2Cross.y },
		{ x: p2.x, y: p2.y },
		{ x: p1.x, y: p1.y },
	]);
}

function drawLines(path: SkPath, points: Point[]) {
	if (points.length === 0) return;

	path.moveTo(points[0]!.x, points[0]!.y);
	for (let i = 1; i < points.length; i++) {
		path.lineTo(points[i]!.x, points[i]!.y);
	}
	path.close();
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

// FIXME: Doesn't work innerradius is set to 0, need to investigate why. If it is set to a very small number, it works fine. COPILOT: This is a known issue in Skia when the path has self-intersection. Issue also occurs when rounding is set and innerRadius is small.
// QUICKFIX: If innerRadius is 0, we can set it to a very small number like 0.001 to avoid the issue.
// TODO: Verify the rounding of corners throughly
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
	const innerRadius = Math.max(0.0001, style.innerRadius ?? 100);
	const interSliceGap = style.interSliceGap ?? 20;
	const cx = width / 2;
	const cy = height / 2;

	const { paths, total } = useMemo(() => {
		const total = slices.reduce((sum, slice) => sum + slice.value, 0);
		let startAngle = style.startAngle ?? 0;

		const paths = slices.map(({ value, color, radius: givenRoundRadius = 0 }, index) => {
			const sweepAngleTobeAdded = (value / total) * 360;
			let currentStartAngle = startAngle;
			let sweepAngle = sweepAngleTobeAdded;
			startAngle += sweepAngleTobeAdded;

			const outerCircleLength = 2 * Math.PI * radius;
			const innerCircleLength = 2 * Math.PI * innerRadius;
			const roundRadius = Math.min(givenRoundRadius, (radius - innerRadius) / 2, innerCircleLength / 2);

			let angleReductionForGap = !interSliceGap ? 0 : (interSliceGap / outerCircleLength) * 360;
			let angleReductionForRounding = (roundRadius / outerCircleLength) * 360 * 2;
			let angleReductionForInnerCircle = (roundRadius / innerCircleLength) * 360 * 2;

			currentStartAngle += angleReductionForGap / 2;
			sweepAngle -= angleReductionForGap;

			let innerCircleStartAngle = currentStartAngle;
			let innerCircleSweepAngle = sweepAngle;

			const boundaryCircleStartingAngle = currentStartAngle + angleReductionForRounding / 2;
			const boundaryCircleSweepAngle = sweepAngle - angleReductionForRounding;

			const innerCircleBoundaryStartingAngle = innerCircleStartAngle + angleReductionForInnerCircle / 2;
			const innerCircleBoundarySweepAngle = innerCircleSweepAngle - angleReductionForInnerCircle;
			// Outer Circle
			let [x1, y1, x2, y2] = getCircularPoints(
				boundaryCircleStartingAngle,
				radius,
				boundaryCircleSweepAngle,
				cx,
				cy
			);

			let [cx1, cy1, cx2, cy2] = getCircularPoints(
				currentStartAngle,
				radius,
				sweepAngle,
				cx,
				cy
			);

			let [rx1, ry1, rx2, ry2] = getCircularPoints(
				currentStartAngle,
				radius - roundRadius,
				sweepAngle,
				cx,
				cy
			);

			// Inner circle
			let [ix1, iy1, ix2, iy2] = getCircularPoints(
				innerCircleBoundaryStartingAngle,
				innerRadius,
				innerCircleBoundarySweepAngle,
				cx,
				cy
			);

			let [cix1, ciy1, cix2, ciy2] = getCircularPoints(
				innerCircleStartAngle,
				innerRadius,
				innerCircleSweepAngle,
				cx,
				cy
			);
			let [rix1, riy1, rix2, riy2] = getCircularPoints(
				innerCircleStartAngle,
				innerRadius + roundRadius,
				innerCircleSweepAngle,
				cx,
				cy
			);

			let path = Skia.Path.Make();
			drawRoundedCorner(path, { x: cx2, y: cy2 }, { x: x2, y: y2 }, { x: rx2, y: ry2 }, roundRadius);
			drawRoundedCorner(path, { x: cix2, y: ciy2 }, { x: rix2, y: riy2 }, { x: ix2, y: iy2 }, roundRadius);
			drawLines(path, [
				{ x: x2, y: y2 },
				{ x: rx2, y: ry2 },
				{ x: rix2, y: riy2 },
				{ x: ix2, y: iy2 },
				{ x: x2, y: y2 },
			]);

			path.moveTo(x1, y1);
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
				innerCircleBoundaryStartingAngle + 180 + innerCircleBoundarySweepAngle,
				-innerCircleBoundarySweepAngle
			);
			path.lineTo(x1, y1);
			path.close();

			drawRoundedCorner(path, { x: cix1, y: ciy1 }, { x: ix1, y: iy1 }, { x: rix1, y: riy1 }, roundRadius);
			drawRoundedCorner(path, { x: cx1, y: cy1 }, { x: rx1, y: ry1 }, { x: x1, y: y1 }, roundRadius);
			drawLines(path, [
				{ x: ix1, y: iy1 },
				{ x: rix1, y: riy1 },
				{ x: rx1, y: ry1 },
				{ x: x1, y: y1 },
				{ x: ix1, y: iy1 },
			]);

			return { path, color: color ?? getRandomRGBColor() };
		});
		return { paths, total };
	}, [
		slices,
		radius,
		innerRadius,
		interSliceGap,
		cx,
		cy,
		style.startAngle
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