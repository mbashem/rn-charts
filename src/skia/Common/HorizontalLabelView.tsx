import { View, type LayoutChangeEvent } from "react-native";
import { type CommonStyle } from '../common';
import React, { useMemo, useState } from "react";

interface HorizontalLabelStyle extends CommonStyle {
	width?: number;
	height?: number;
	left?: number;
}

interface HorizontalLabelProps {
	labels: (string | undefined)[];
	positions: number[];
	styles: HorizontalLabelStyle;
	onLayout?: (event: LayoutChangeEvent) => void;
	children: (label?: string) => JSX.Element;
}

function HorizontalLabelView({
	labels,
	positions,
	styles,
	onLayout,
	children
}: HorizontalLabelProps) {
	const {
		width,
		height,
		backgroundColor,
		left
	} = styles;
	const [maxHeight, setMaxHeight] = useState(height);
	useMemo(() => {
		setMaxHeight(height)
	}, [height])

	return (
		<View
			style={{
				left,
				width,
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
			<View style={{ position: "relative", height: (maxHeight ?? 0), paddingVertical: 0}}>
				{labels.map((label, index) => {
					return <View
						key={label + " " + index}
						style={{ position: "absolute", left: positions[index], top: 0, backgroundColor: "purple" }}
						onLayout={(event) => {
							let height = event.nativeEvent.layout.height
							if(styles.height !== undefined)
								setMaxHeight(styles.height)
							else {
								if(index === 0) {
									setMaxHeight(height)
								} else {
									setMaxHeight(prevHeight => Math.max(height, prevHeight ?? 0));
								}
							}
						}}
					>
						{children(label)}
					</View>;
				})}
			</View>
		</View>
	);
}

export default HorizontalLabelView;
