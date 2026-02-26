import { View, type LayoutChangeEvent } from "react-native";
import { getPaddings, type CommonStyle } from '../common';
import React, { useEffect, useState } from "react";
import { Canvas, Group, Line } from "@shopify/react-native-skia";

export interface HorizontalLabelStyle {
	height?: number;
	backgroundColor?: string;
	strokeWidth?: number;
	strokeColor?: string;
	strokePosition?: "top" | "bottom";
}

export interface HorizontalLabelStyleExtended extends HorizontalLabelStyle {
	viewPosition?: "top" | "bottom";
}

interface HorizontalLabelViewStyle extends CommonStyle {
	width: number;
	left?: number;
	horizontalLabelStyle?: HorizontalLabelStyleExtended;
};

interface HorizontalLabelProps<T> {
	labels: T[];
	positions: number[];
	style: HorizontalLabelViewStyle;
	onLayout?: (event: LayoutChangeEvent) => void;
	children?: (index: number, data: T) => JSX.Element | undefined;
	labelSkiaView?: (
		yPosition: number,
		index: number,
		data: T,
	) => React.JSX.Element | undefined;
}

function HorizontalLabelView<T>({
	labels,
	positions,
	style,
	onLayout,
	children,
	labelSkiaView
}: HorizontalLabelProps<T>) {
	const {
		width,
		backgroundColor,
		left,
		horizontalLabelStyle = {}
	} = style;

	const {
		height,
		strokeColor = "white",
		strokePosition = "top",
		strokeWidth = 0,
	} = horizontalLabelStyle;
	const { paddingLeft = 0 } = getPaddings(style);

	const [maxHeight, setMaxHeight] = useState(height);
	useEffect(() => {
		setMaxHeight(height);
	}, [height]);

	return (
		<View
			style={{
				left,
				width: width,
				height: (maxHeight ?? 0),
				backgroundColor,
				flexDirection: "row-reverse",
				justifyContent: "flex-end",
				overflow: "hidden"
			}}
			onLayout={(event) => {
				onLayout?.(event);
			}}
		>
			<View style={{ position: "relative", height: (maxHeight ?? 0), paddingVertical: 0 }}>
				{labels.map((label, index) => {
					return <View
						key={index}
						style={{ position: "absolute", left: positions[index], top: strokeWidth, backgroundColor: "purple" }}
						onLayout={(event) => {
							let height = event.nativeEvent.layout.height;
							if (horizontalLabelStyle.height !== undefined)
								setMaxHeight(horizontalLabelStyle.height);
							else {
								if (index === 0) {
									setMaxHeight(height + strokeWidth);
								} else {
									setMaxHeight(prevHeight => Math.max(height + strokeWidth, prevHeight ?? 0));
								}
							}
						}}
					>
						{children?.(index, label)}
					</View>;
				})}
			</View>
			{(labelSkiaView || strokeWidth > 0) &&
				<Canvas style={{ position: "absolute", width, height: labelSkiaView ? (maxHeight ?? 0) : strokeWidth, }}>
					{labelSkiaView && labels.map((label, index) => {
						let yPosition = positions[index];
						if (yPosition === undefined) return null;
						return <Group key={index}>{labelSkiaView(yPosition, index, label)}</Group>;
					})}
					{strokeWidth > 0 &&
						<Line
							p1={{ x: paddingLeft, y: strokePosition === "top" ? strokeWidth / 2 : (maxHeight ?? height ?? 0) - strokeWidth / 2 }}
							p2={{ x: width, y: strokePosition === "top" ? strokeWidth / 2 : (maxHeight ?? height ?? 0) - strokeWidth / 2 }}
							color={strokeColor}
							strokeWidth={strokeWidth}
						/>
					}
				</Canvas>
			}
		</View >
	);
}

export default HorizontalLabelView;
