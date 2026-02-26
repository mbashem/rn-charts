// import type { View } from "react-native-reanimated/lib/typescript/Animated";
// import type { DayData, HeatMapProps } from "./HeatMap";
// import { useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
// import { getPaddings } from "../common";

// function useHeatMap({
// 	rows
// 	style,
// 	minValue,
// 	maxValue,
// 	ref,
// 	popupStyle
// }: HeatMapProps) {

// 	const cellSize = style?.cellSize ?? 24;
// 	const cellGap = style?.cellGap ?? 4;
// 	const cellMaxColor = style?.cellMaxColor ?? '#50f555ff';
// 	const cellMinColor = style?.cellMinColor ?? '#ffffffff';

// 	const [verticalLabelWidth, setVerticalLabelWidth] = useState<number>(0);
// 	const [horizontalLabelHeight, setHorizontalLabelHeight] = useState<number>(0);
// 	const {
// 		paddingLeft,
// 		paddingRight,
// 		paddingTop,
// 		paddingBottom
// 	} = getPaddings(style);

// 	const numberOfDaysInWeek = 7;
// 	const numberOfRows = rows;
// 	const numberOfMsInDay = 1000 * 60 * 60 * 24;
// 	const xLabels = useMemo(() => {
// 		return (data ?? []).map(())
// 	}, [data])

// 	const [popupData, setPopupData] = useState<
// 		{ x: number; y: number; day: DayData; } | undefined
// 	>(undefined);

// 	const [popupDimension, setPopupDimension] = useState({
// 		width: 0,
// 		height: 0,
// 	});

// 	const popupRef = useRef<View>(null);

// 	const formatDate = (date: Date) =>
// 		`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
// 			2,
// 			'0'
// 		)}-${String(date.getDate()).padStart(2, '0')}`;

// 	const { daysInRange, computedMin, computedMax } = useMemo(() => {
// 		const start = new Date(startDate);
// 		const end = new Date(endDate);

// 		const output: DayData[] = [];
// 		let computedMax = Number.MIN_VALUE;
// 		let computedMin = Number.MAX_VALUE;

// 		const startDayOfWeek = start.getDay();

// 		for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
// 			const dateStr = formatDate(d);
// 			const value = data?.[dateStr] ?? 0;

// 			const dayOfWeek = d.getDay();
// 			const daysFromStart = Math.floor(
// 				(d.getTime() - start.getTime()) / numberOfMsInDay
// 			);

// 			const week = Math.floor(
// 				(startDayOfWeek + daysFromStart) / numberOfDaysInWeek
// 			);

// 			computedMax = Math.max(computedMax, value);
// 			computedMin = Math.min(computedMin, value);

// 			output.push({
// 				date: dateStr,
// 				value,
// 				dayOfWeek,
// 				week,
// 				x: week * (cellSize + cellGap),
// 				y: dayOfWeek * (cellSize + cellGap),
// 			});
// 		}

// 		return {
// 			daysInRange: output,
// 			computedMin: minValue !== undefined ? minValue : computedMin,
// 			computedMax: maxValue !== undefined ? maxValue : computedMax,
// 		};
// 	}, [startDate, endDate, data, minValue, maxValue, cellSize, cellGap]);

// 	// --- COLOR LOGIC ---
// 	const getColor = (value: number) => {
// 		if (value <= 0) return cellMinColor;

// 		const intensity = Math.min(
// 			1,
// 			Math.max(0, (value - computedMin) / (computedMax - computedMin || 1))
// 		);

// 		const bigint = parseInt(cellMaxColor.replace('#', ''), 16);
// 		const r = (bigint >> 16) & 255;
// 		const g = (bigint >> 8) & 255;
// 		const b = bigint & 255;

// 		const mix = (base: number) => Math.round(255 - (255 - base) * intensity);

// 		return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
// 	};

// 	// Heatmap size
// 	const numWeeks = Math.ceil(daysInRange.length / 7 + 1);
// 	const totalWidth = numWeeks * (cellSize + cellGap) + verticalLabelWidth;
// 	const totalHeight = 7 * (cellSize + cellGap);

// 	// --- POPUP MEASUREMENT ---
// 	useLayoutEffect(() => {
// 		if (popupRef.current) {
// 			popupRef.current.measure((x, y, width, height) => {
// 				setPopupDimension({ width, height });
// 			});
// 		}
// 	}, [popupData]);

// 	// --- TOUCH HANDLER ---
// 	const touchHandler = (x: number, y: number) => {
// 		if (!popupStyle?.renderPopup || (x < 0 || y < 0 || x >= totalWidth || y >= totalHeight)) {
// 			setPopupData(undefined);
// 			return;
// 		}

// 		const col = Math.floor(x / (cellSize + cellGap));
// 		const row = Math.floor(y / (cellSize + cellGap));

// 		const start = new Date(startDate);
// 		const startDayOfWeek = start.getDay();

// 		const index = col * numberOfDaysInWeek + row;

// 		if (
// 			index >= startDayOfWeek &&
// 			index - startDayOfWeek < daysInRange.length
// 		) {
// 			const day = daysInRange[index - startDayOfWeek];
// 			if (day) {
// 				setPopupData({
// 					x: col * (cellSize + cellGap),
// 					y: row * (cellSize + cellGap),
// 					day,
// 				});
// 				return;
// 			}
// 		}

// 		setPopupData(undefined);
// 	};
// 	const onTouchOutside = () => {
// 		setPopupData(undefined);
// 	};

// 	useImperativeHandle(ref, () => ({
// 		touchedOutside: () => {
// 			setPopupData(undefined);
// 		}
// 	}), [ref]);

// 	return {
// 		daysInRange,
// 		computedMin,
// 		computedMax,
// 		totalWidth,
// 		totalHeight,
// 		popupData,
// 		popupRef,
// 		popupDimension,
// 		touchHandler,
// 		getColor,
// 		cellSize,
// 		onTouchOutside,
// 		verticalLabelWidth,
// 		setVerticalLabelWidth,
// 		horizontalLabelHeight,
// 		setHorizontalLabelHeight,
// 		numberOfRows,
// 		paddingLeft,
// 		paddingRight,
// 		paddingTop,
// 		paddingBottom
// 	};
// }

// export default useHeatMap;

// import React, { type Ref } from 'react';
// import { View } from 'react-native';
// import { Canvas, Group, Rect, rect, type SkHostRect } from '@shopify/react-native-skia';
// import useHeatMap from './useHeatMap';
// import type { CommonStyle, HandleOutSideTouch } from '../common';
// import Popup, { type PopupStyle } from '../Popup';
// import VerticalLabelView, { type VerticalLabelStyle } from "../Common/VerticalLabelView";
// import HorizontalLabelView, { type HorizontalLabelStyleExtended } from "../Common/HorizontalLabelView";

// export type DayData = {
//   date: string;
//   value: number;
//   dayOfWeek: number;
//   week: number;
//   x: number;
//   y: number;
// };

// export interface HeatMapDataGroup {
//   cols: number;
//   data?: Record<string, number>;
// }

// export interface HeatMapStyle extends CommonStyle, VerticalLabelStyle {
//   cellSize?: number;
//   cellGap?: number;
//   cellMaxColor?: string;
//   cellMinColor?: string;
//   horizontalLabelStyle?: HorizontalLabelStyleExtended;
//   verticalLabelStyle?: VerticalLabelStyle;
//   interGroupSpacing?: number;
// }

// export interface HeatMapProps {
//   rows: number;
//   data: HeatMapDataGroup[];
//   // InterGroupSpacing is only applied when coalesceGroups is false
//   coalesceGroups: boolean;
//   style?: HeatMapStyle;
//   minValue?: number;
//   maxValue?: number;
//   xLabelSkiaView?: (
//     label: string,
//     position: { x: number; y: number; }
//   ) => React.JSX.Element | undefined;
//   yLabelSkiaView?: (
//     index: number,
//     yPosition: number
//   ) => React.JSX.Element | undefined;

//   xLabelView?: (
//     label: string
//   ) => React.JSX.Element | undefined;
//   yLabelView?: (
//     index: number
//   ) => React.JSX.Element | undefined;

//   daySkiaView?: (
//     rect: SkHostRect,
//     day: DayData
//   ) => React.JSX.Element | undefined;

//   onSelectSkiaView?: (
//     rect: SkHostRect,
//     day: DayData
//   ) => React.JSX.Element | undefined;
//   onSelectView?: (
//     rect: SkHostRect,
//     day: DayData
//   ) => React.JSX.Element | undefined;
//   ref?: Ref<HandleOutSideTouch | undefined>;
//   popupStyle?: PopupStyle<DayData>;
// }

// function HeatMap({ yLabelView, yLabelSkiaView, xLabelView, xLabelSkiaView, daySkiaView, onSelectView, onSelectSkiaView, ...props }: HeatMapProps) {
//   const {
//     daysInRange,
//     totalWidth,
//     totalHeight,
//     popupData,
//     popupRef,
//     popupDimension,
//     touchHandler,
//     getColor,
//     cellSize,
//     onTouchOutside,
//     horizontalLabelHeight,
//     verticalLabelWidth,
//     setHorizontalLabelHeight,
//     setVerticalLabelWidth,
//     numberOfRows,
//     paddingTop,
//     paddingBottom,
//     paddingLeft,
//     paddingRight
//   } = useHeatMap(props);

//   const [viewOffset, setViewOffset] = React.useState({ x: 0, y: 0 });
//   const onSelectSkiaViewMemo = React.useMemo(() => {
//     if (!popupData || !onSelectSkiaView) {
//       return undefined;
//     }
//     return onSelectSkiaView?.(rect(popupData.x, popupData.y, cellSize, cellSize), popupData.day);
//   }, [popupData, onSelectSkiaView, cellSize]);

//   const onSelectViewMemo = React.useMemo(() => {
//     if (!popupData || !onSelectView) {
//       return undefined;
//     }
//     return onSelectView(rect(popupData.x, popupData.y, cellSize, cellSize), popupData.day);
//   }, [popupData, onSelectView, cellSize]);

//   return <View
//     style={{ backgroundColor: props.style?.backgroundColor }}
//     ref={(view) => {
//       view?.measureInWindow((fx, fy) => {
//         setViewOffset((prev) => {
//           if (prev.x === fx && prev.y === fy) {
//             return prev;
//           }
//           return { x: fx, y: fy };
//         });
//       });
//     }}
//   >
//     <View style={{ flexDirection: "row" }}>
//       {
//         (yLabelView || yLabelSkiaView) && (<VerticalLabelView
//           onLayout={(event) => {
//             setVerticalLabelWidth(event.nativeEvent.layout.width);
//           }}
//           labelPercentages={Array.from({ length: numberOfRows }, (_, i) => (i + 1) / numberOfRows)}
//           styles={{
//             height: totalHeight,
//             verticalLabelStyle: props.style?.verticalLabelStyle,
//           }}
//           labelSkiaView={(_percentage, yPosition, index) => yLabelSkiaView?.(index, yPosition)}
//         >
//           {(_percentage, index) => yLabelView?.(index)}
//         </VerticalLabelView>)
//       }
//       <View style={{ width: totalWidth, height: totalHeight }}>
//         {
//           (xLabelView || xLabelSkiaView) &&
//           <HorizontalLabelView
//             labels={}
//             positions={xLabelsData.map(labelData => labelData.xPosition)}
//             style={{
//               width: totalWidth,
//               height: props.style?.x ?? 0
//             }}
//             onLayout={(event) => setHorizontalLabelHeight(event.nativeEvent.layout.height)}
//           >
//             {label => xLabelView(label)}
//           </HorizontalLabelView>
//         }
//         <Canvas
//           style={{ width: totalWidth, height: totalHeight }}
//           onTouchStart={(event) =>
//             touchHandler(event.nativeEvent.locationX, event.nativeEvent.locationY)
//           }
//         >
//           <Group>
//             {daysInRange.map((day) => {
//               let skiaView = daySkiaView?.(rect(day.x, day.y, cellSize, cellSize), day);
//               if (skiaView !== undefined) { return skiaView; }

//               return (
//                 <Rect
//                   key={day.date}
//                   x={day.x}
//                   y={day.y}
//                   width={cellSize}
//                   height={cellSize}
//                   color={getColor(day.value)}
//                 />
//               );
//             })}
//             {onSelectSkiaViewMemo}
//           </Group>
//         </Canvas>
//       </View>
//     </View>

//     {
//       popupData && (<>
//         {onSelectViewMemo &&
//           <View
//             style={{
//               position: "absolute",
//               top: popupData.y + (props.style?.horizontalLabelStyle?.viewPosition === "bottom" ? 0 : horizontalLabelHeight),
//               left: popupData.x + verticalLabelWidth
//             }}
//           >
//             {onSelectViewMemo}
//           </View>
//         }
//         <Popup
//           popupData={{ x: popupData.x + verticalLabelWidth, y: popupData.y + (props.style?.horizontalLabelStyle?.viewPosition === "bottom" ? 0 : horizontalLabelHeight), data: popupData.day }}
//           totalWidth={totalWidth}
//           totalHeight={totalHeight}
//           touchHandler={(x, y) => {
//             touchHandler(x - verticalLabelWidth - paddingLeft, y - (props.style?.horizontalLabelStyle?.viewPosition === "bottom" ? 0 : horizontalLabelHeight));
//           }}
//           onTouchOutside={onTouchOutside}
//           popupStyle={props.popupStyle}
//           viewOffset={viewOffset}
//         />
//       </>
//       )
//     }
//   </View >;
// }

// export default HeatMap;

// <HeatMap
//   startDate="2020-10-22"
//   endDate="2020-12-21"
//   data={[{
//     "2020-10-22": 50,
//     "2020-10-23": 10,
//     "2020-10-24": 15,
//     "2020-10-25": 20,
//     "2020-10-26": 25,
//     "2020-10-27": 30,
//     "2020-10-28": 35,
//     "2020-10-29": 40,
//     "2020-10-30": 45,
//     "2020-10-31": 50,
//     "2020-12-20": 50,
//     "2020-12-21": 50,
//   }]}
//   style={{ verticalLabelStyle: { width: 70, strokeWidth: 0 } }}
//   yLabelView={(index) => <View><Text>Hello - {index}</Text></View>}
//   yLabelSkiaView={(index, yPosition) => <Rect x={0} y={yPosition} width={20} height={20} color={"red"} />}
//   daySkiaView={(rect, day) => {
//     if ((day.week + day.dayOfWeek) % 2 === 0) { return undefined; }
//     return <Rect
//       key={day.date}
//       x={rect.x}
//       y={rect.y}
//       width={rect.width}
//       height={rect.height}
//       color={"green"}
//     />;
//   }}
//   onSelectView={(rect, day) => {
//     return <View style={{ backgroundColor: "yellow", opacity: 0.2, padding: 10 }}>
//       <Text style={{ color: "green" }}>Selected {day.date}</Text>
//     </View>;
//   }}
//   onSelectSkiaView={(rect, day) => {
//     return <Rect
//       key={day.date}
//       x={rect.x}
//       y={rect.y}
//       width={rect.width}
//       height={rect.height}
//       color={"yellow"}
//     />;
//   }}
//   popupStyle={{
//     width: 10,
//     height: 10,
//     renderPopup: (day) => (
//       <VStack style={{ padding: 8, backgroundColor: "black", borderRadius: 8 }}>
//         <Text>{day.value}</Text>
//         <Text>{day.date}</Text>
//       </VStack>
//     ),
//   }}
// />