import { Canvas, Path } from '@shopify/react-native-skia';
import { type CommonStyles } from '../common';
import { View } from 'react-native';
import ToolTip from '../Tooltip';
import { usePieChart, type PieSlice } from './usePieChart';

export type PieChartProps = {
  slices: PieSlice[];
  style: PieChartStyles;
  centerView?: React.ReactNode;
  onSliceTouch?: (slice: PieSlice | undefined) => void;
  showTooltipOnTouch?: boolean;
};

export interface PieChartStyles extends CommonStyles {
  radius?: number;
  innerRadius?: number;
  innerColor?: string;
}

function PieChart({
  style,
  slices,
  centerView,
  onSliceTouch,
  showTooltipOnTouch,
}: PieChartProps) {
  const { radius, innerRadius, paths, tooltip, onCanvasTouchStart } =
    usePieChart(slices, style, onSliceTouch, showTooltipOnTouch);

  const paddingTop = style.paddingTop ?? style.padding ?? 0;
  const paddingBottom = style.paddingBottom ?? style.padding ?? 0;
  const paddingLeft = style.paddingLeft ?? style.padding ?? 0;
  const paddingRight = style.paddingRight ?? style.padding ?? 0;

  return (
    <View
      style={{
        paddingTop: paddingTop,
        paddingBottom: paddingBottom,
        paddingRight: paddingRight,
        paddingLeft: paddingLeft,
        backgroundColor: style.backgroundColor ?? 'transparent',
      }}
    >
      {centerView && (
        <View
          style={{
            position: 'absolute',
            top: paddingTop + radius - innerRadius,
            left: paddingLeft + radius - innerRadius,
            width: innerRadius * 2,
            height: innerRadius * 2,
            borderRadius: innerRadius,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: style.innerColor ?? 'black',
          }}
        >
          {centerView}
        </View>
      )}
      <Canvas
        style={{
          width: radius * 2,
          height: radius * 2,
          backgroundColor: style.backgroundColor ?? 'transparent',
        }}
        onTouchStart={onCanvasTouchStart}
      >
        {paths.map(({ path, color }, index) => (
          <Path key={index} path={path} color={color} stroke={{ width: 5 }} />
        ))}
        <ToolTip data={tooltip} style={{ padding: 5 }} />
      </Canvas>
    </View>
  );
}

export default PieChart;
