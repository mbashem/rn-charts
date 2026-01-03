import { Canvas, Path } from '@shopify/react-native-skia';
import { type CommonStyle } from '../common';
import { Text, View } from 'react-native';
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
};

export type PieChartProps = {
  slices: PieSlice[];
  style: PieChartStyles;
  centerView?: React.ReactNode;
  onSliceTouch?: (slice: PieSlice | undefined) => void;
  popupStyle?: PopupStyle<PieSlice>;
};

export interface PieChartStyles extends CommonStyle {
  radius?: number;
  innerRadius?: number;
  innerColor?: string;
}

function PieChart(props: PieChartProps) {
  const { radius, innerRadius, paths, popupData, touchHandler } =
    usePieChart(props);
  const { style, centerView, popupStyle } = props;

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
        onTouchStart={(event) =>
          touchHandler(event.nativeEvent.locationX, event.nativeEvent.locationY)
        }
      >
        {paths.map(({ path, color }, index) => (
          <Path key={index} path={path} color={color} stroke={{ width: 5 }} />
        ))}
      </Canvas>
      {popupData && (
        <Popup
          popupData={{
            x: popupData.centerX,
            y: popupData.centerY,
            data: popupData.data,
          }}
          totalWidth={radius * 2}
          totalHeight={radius * 2}
          touchHandler={(x, y) => touchHandler(x - paddingLeft, y - paddingTop)}
          viewOffset={viewOffset}
          popupStyle={popupStyle}
        />
      )}
    </View>
  );
}

export default PieChart;
