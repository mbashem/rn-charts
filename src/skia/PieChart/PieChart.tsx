import { Canvas, Path } from '@shopify/react-native-skia';
import { type CommonStyle } from '../common';
import { View } from 'react-native';
import { usePieChart } from './usePieChart';
import Popup, { type PopupStyle } from '../Popup';
import { useState } from 'react';

export interface PopupData {
  centerX: number;
  centerY: number;
  data: PieSlice;
}

export type PieSlice = {
  value: number;
  color?: string;
  label?: string;
  radius?: number;
};

export type PieChartProps = {
  slices: PieSlice[];
  style: PieChartStyles;
  centerView?: React.ReactNode;
  centerSkiaView?: (centerX: number, centerY: number, radius: number) => React.ReactNode;
  onSliceTouch?: (slice: PieSlice | undefined) => void;
  popupStyle?: PopupStyle<PieSlice>;
};

export interface PieChartStyles extends CommonStyle {
  radius?: number;
  innerRadius?: number;
  innerColor?: string;
  interSliceGap?: number;
}

function PieChart({ popupStyle, centerSkiaView, centerView, ...props }: PieChartProps) {
  const { radius, width, height, cx, cy, innerRadius, paths, popupData, touchHandler } =
    usePieChart(props);

  const { style } = props;
  const paddingTop = style.paddingTop ?? style.padding ?? 0;
  const paddingBottom = style.paddingBottom ?? style.padding ?? 0;
  const paddingLeft = style.paddingLeft ?? style.padding ?? 0;
  const paddingRight = style.paddingRight ?? style.padding ?? 0;
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });

  return (
    <View
      style={{
        paddingTop: paddingTop,
        paddingBottom: paddingBottom,
        paddingRight: paddingRight,
        paddingLeft: paddingLeft,
        backgroundColor: style.backgroundColor ?? 'transparent',
      }}
      ref={(view) => {
        view?.measureInWindow((fx, fy) => {
          setViewOffset((prev) => {
            if (prev.x === fx && prev.y === fy) {
              return prev;
            }
            return { x: fx, y: fy };
          });
        });
      }}
    >
      {centerView && (
        <View
          style={{
            position: 'absolute',
            top: paddingTop + cx - innerRadius,
            left: paddingLeft + cy - innerRadius,
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
          width,
          height,
          backgroundColor: style.backgroundColor ?? 'transparent',
        }}
        onTouchStart={(event) =>
          touchHandler(event.nativeEvent.locationX, event.nativeEvent.locationY)
        }
      >
        {paths.map(({ path, color }, index) => (
          <Path key={index} path={path} color={color} />
        ))}
        {centerSkiaView && centerSkiaView(cx, cy, innerRadius)}
      </Canvas>
      {popupData && (
        <Popup
          popupData={{
            x: popupData.centerX,
            y: popupData.centerY,
            data: popupData.data,
          }}
          totalWidth={width}
          totalHeight={height}
          touchHandler={(x, y) => touchHandler(x - paddingLeft, y - paddingTop)}
          viewOffset={viewOffset}
          popupStyle={popupStyle}
        />
      )}
    </View>
  );
}

export default PieChart;
