import { Group, RoundedRect, Text } from "@shopify/react-native-skia";
import { font } from "./common";

export interface TooltipData {
	x: number;
	y: number;
	label: string;
}

export default function ToolTip({ data }: { data: TooltipData | undefined }) {
	const padding = 5;

	if (!data) return null;
	const { width: textWidth, height: textHeight } = font.measureText(data.label);
	const width = textWidth + padding * 2;
	const height = textHeight + padding * 2;

	const { x, y, label } = data;

	const tooltipX = x;
	const tooltipY = y + height;

	return (
		<Group>
			<RoundedRect x={tooltipX} y={tooltipY} width={width} height={height} r={8} color="gray" opacity={0.85} />
			<Text x={tooltipX + padding} y={tooltipY + height / 2 + padding} text={label} color="white" font={font} />
		</Group>
	);
}