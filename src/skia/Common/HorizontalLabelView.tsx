import { View, type LayoutChangeEvent } from "react-native";
import { type CommonStyle } from '../common';
import React, { useMemo, useState } from "react";

interface HorizontalLabelStyle extends CommonStyle {
	width?: number;
	height?: number;
}

interface HorizontalLabelProps {
	labels: string[];
	positions: number[];
	styles: HorizontalLabelStyle;
	onLayout?: (event: LayoutChangeEvent) => void;
	children: (label: string) => JSX.Element;
}

function VerticalLabelView({
	labels,
	positions,
	styles,
	onLayout,
	children
}: HorizontalLabelProps) {
	const {
		height,
		backgroundColor,
	} = styles;
	const [maxHeight, setMaxHeight] = useState(height);
	useMemo(() => {
		setMaxHeight(height)
	}, [height])

	return (
		<View
			style={{
				height: (maxHeight ?? 0),
				backgroundColor,
				flexDirection: "row-reverse",
				justifyContent: "flex-end"
			}}
			onLayout={(event) => {
				onLayout?.(event);
			}}
		>
			<View style={{ position: "relative", height: (maxHeight ?? 0), paddingVertical: 0}}>
				{labels.map((label, index) => {
					return <View
						key={label}
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

export default VerticalLabelView;
