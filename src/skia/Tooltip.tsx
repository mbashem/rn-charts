import { Group, RoundedRect, Text, type SkColor, type SkFont } from '@shopify/react-native-skia';
import { font } from './common';

export interface ToolTipStyle {
  padding?: number;
  backgroundColor?: SkColor;
  textColor?: string;
  borderRadius?: number;
  backgroundOpacity?: number;
  font?: SkFont
}

export interface TooltipData {
  centerX: number;
  centerY: number;
  label: string;
}

interface ToolTipProps {
  data: TooltipData | undefined;
  style?: ToolTipStyle;
}

export default function ToolTip({ data, style }: ToolTipProps) {
  const padding = style?.padding ?? 5;

  if (!data) return null;
  const { width: textWidth, height: textHeight } = (style?.font ?? font).measureText(data.label);
  const width = textWidth + padding * 2;
  const height = textHeight + padding * 2;

  const { centerX, centerY, label } = data;

  let tooltipX = centerX - width / 2;
  let tooltipY = centerY - height / 2;
  tooltipX = Math.max(0, tooltipX);
  tooltipY = Math.max(0, tooltipY);
  
  return (
    <Group>
      <RoundedRect
        x={tooltipX}
        y={tooltipY}
        width={width}
        height={height}
        r={style?.borderRadius ?? 8}
        color={style?.backgroundColor ?? "gray"}
        opacity={style?.backgroundOpacity ?? 0.85}
      />
      <Text
        x={tooltipX + padding}
        y={tooltipY + height - padding}
        text={label}
        color={style?.textColor ?? "white"}
        font={font}
      />
    </Group>
  );
}
