import { Group, RoundedRect, Text } from '@shopify/react-native-skia';
import { font } from './common';

export interface ToolTipStyles {
  padding?: number;
}

export interface TooltipData {
  centerX: number;
  centerY: number;
  label: string;
}

interface ToolTipProps {
  data: TooltipData | undefined;
  style?: ToolTipStyles;
}

export default function ToolTip({ data, style }: ToolTipProps) {
  const padding = style?.padding ?? 5;

  if (!data) return null;
  const { width: textWidth, height: textHeight } = font.measureText(data.label);
  const width = textWidth + padding * 2;
  const height = textHeight + padding * 2;

  const { centerX, centerY, label } = data;

  const tooltipX = centerX - width / 2;
  const tooltipY = centerY - height / 2;

  return (
    <Group>
      <RoundedRect
        x={tooltipX}
        y={tooltipY}
        width={width}
        height={height}
        r={8}
        color="gray"
        opacity={0.85}
      />
      <Text
        x={tooltipX + padding}
        y={tooltipY + height - padding}
        text={label}
        color="white"
        font={font}
      />
    </Group>
  );
}
