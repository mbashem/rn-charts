import { View, type LayoutChangeEvent } from "react-native";
import { Canvas, Line } from '@shopify/react-native-skia';
import { getPaddings, type CommonStyle } from '../common';
import useComponentLayout from "./useComponentLayout";
import React, { useMemo, useState } from "react";

export interface VerticalLabelStyle {
	yLabelWidth?: number;
	yLabelBackgroundColor?: string;
	yLabelStrokeWidth?: number;
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
	children: (percentage: number) => JSX.Element;
}

function VerticalLabelView({
	labelPercentages,
	styles,
	onLayout,
	children
}: VerticalLabelProps) {
	const {
		width,
		height,
		strokeWidth = 2,
		strokeColor = 'white',
		backgroundColor,
	} = styles;
	const { paddingTop = 0, paddingBottom = 0 } = getPaddings(styles);
	const [viewLayout, onViewLayout] = useComponentLayout();
	const [maxWidth, setMaxWidth] = useState(width);
	useMemo(() => {
		setMaxWidth(width)
	}, [width])

	return (
		<View
			style={{
				width: (maxWidth ?? 0) + strokeWidth,
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
			<View style={{ position: "relative", width: (maxWidth ?? 0) - strokeWidth, paddingVertical: 0, height: height}}>
				{labelPercentages.map((percentage, index) => {
					return <View
						key={percentage}
						style={{ position: "absolute", top: (1 - percentage) * height, backgroundColor: "purple" }}
						onLayout={(event) => {
							let width = event.nativeEvent.layout.width + strokeWidth
							if(styles.width !== undefined)
								setMaxWidth(styles.width)
							else {
								if(index === 0) {
									setMaxWidth(width)
								} else {
									setMaxWidth(prevWidth => Math.max(width, prevWidth ?? 0));
								}
							}
						}}
					>
						{children(percentage)}
					</View>;
				})}
			</View>

			<Canvas style={{ left: -(viewLayout?.width ?? 0) + strokeWidth, width: strokeWidth, height }}>
				<Line
					p1={{ x: 0, y: paddingTop }}
					p2={{ x: 0, y: height - paddingBottom }}
					color={strokeColor}
					strokeWidth={strokeWidth}
				/>

			</Canvas>
		</View>
	);
}

export default VerticalLabelView;
