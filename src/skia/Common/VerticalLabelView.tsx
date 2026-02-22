import { View, type LayoutChangeEvent } from "react-native";
import { Canvas, Group, Line } from '@shopify/react-native-skia';
import { getPaddings, type CommonStyle } from '../common';
import useComponentLayout from "./useComponentLayout";
import React, { useMemo, useState } from "react";

export interface VerticalLabelStyle {
	yLabelWidth?: number;
	yLabelBackgroundColor?: string;
	yLabelStrokeWidth?: number;
	yLabelStrokeColor?: string;
}

interface VerticalLabelViewStyles extends CommonStyle {
	width?: number;
	height: number;
	strokeWidth?: number;
	strokeColor?: string;
}

interface VerticalLabelProps {
	labelPercentages: number[];
	styles: VerticalLabelViewStyles;
	onLayout?: (event: LayoutChangeEvent) => void;
	children: (percentage: number, index: number) => React.JSX.Element | undefined;
	labelSkiaView?: (
		percentage: number,
		yPosition: number,
		index: number
	) => React.JSX.Element | undefined;
}

function VerticalLabelView({
	labelSkiaView,
	labelPercentages,
	styles,
	onLayout,
	children
}: VerticalLabelProps) {
	const {
		width,
		height,
		strokeWidth = 0,
		strokeColor = 'white',
		backgroundColor,
	} = styles;
	const { paddingTop = 0, paddingBottom = 0 } = getPaddings(styles);
	const [viewLayout, onViewLayout] = useComponentLayout();
	const [maxWidth, setMaxWidth] = useState(width);
	useMemo(() => {
		setMaxWidth(width);
	}, [width]);

	return (
		<View
			style={{
				width: (maxWidth ?? 0),
				height,
				backgroundColor,
				flexDirection: "row-reverse",
				justifyContent: "flex-end"
			}}
			onLayout={(event) => {
				onLayout?.(event);
				onViewLayout(event);
			}}
		>
			<View style={{ position: "relative", width: (maxWidth ?? 0) - strokeWidth, paddingVertical: 0, height: height }}>
				{labelPercentages.map((percentage, index) => {
					return <View
						key={percentage}
						style={{ position: "absolute", top: (1 - percentage) * height, backgroundColor: "purple" }}
						onLayout={(event) => {
							let width = event.nativeEvent.layout.width + strokeWidth;
							if (styles.width !== undefined)
								setMaxWidth(styles.width);
							else {
								if (index === 0) {
									setMaxWidth(width + strokeWidth);
								} else {
									setMaxWidth(prevWidth => Math.max(width + strokeWidth, prevWidth ?? 0));
								}
							}
						}}
					>
						{children(percentage, index)}
					</View>;
				})}
			</View>

			<Canvas style={{ position: "absolute", left: 0, width, height, }}>
				{labelSkiaView && labelPercentages.map((percentage, index) => {
					return <Group key={percentage}>{labelSkiaView(percentage, (1 - percentage) * height, index)}</Group>;
				})}

				{strokeWidth > 0 &&
					<Line
						p1={{ x: (maxWidth ?? width ?? 0) - strokeWidth, y: paddingTop }}
						p2={{ x: (maxWidth ?? width ?? 0) - strokeWidth, y: height - paddingBottom }}
						color={strokeColor}
						strokeWidth={strokeWidth}
					/>
				}
			</Canvas>
		</View>
	);
}

export default VerticalLabelView;
