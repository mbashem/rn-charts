// AreaChart.tsx
import { Canvas, Circle, Group, Path, Text } from '@shopify/react-native-skia';
import { type CommonStyle } from '../common';
import VerticalLabel from '../Common/VerticalLabel';
import { View } from 'react-native';
import useAreaChart, { type AreaData } from './useAreaChart';
import { useState } from 'react';
import { lighten } from '../../util/colors';
import Popup, { type PopupStyle } from '../Popup';

export interface AreaChartStyle extends CommonStyle {
  width: number;
  height: number;
  showPoints?: boolean;
  pointRadius?: number;
  lightenPointsBy?: number;
}

export interface AreaChartProps {
  data: AreaData[];
  minValue?: number;
  maxValue?: number;
  xLabels?: string[];
  style?: AreaChartStyle;
  popupStyle: PopupStyle<{ rowIndex: number; colIndex: number; value: number }>;
}

function AreaChart(props: AreaChartProps) {
  const {
    minValue,
    maxValue,
    canvasHeight,
    areaCanvasHeight,
    labelWidth,
    chartWidth,
    paths,
    xLabelsData,
    paddingLeft,
    paddingTop,
    paddingHorizontal,
    font,
    touchLine,
    touchHandler,
  } = useAreaChart(props);
  const { style, popupStyle } = props;

  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  console.log('AreaChart render', { touchLine });

  return (
    <View
      style={[style, { flexDirection: 'row' }]}
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
      <VerticalLabel
        minValue={minValue}
        maxValue={maxValue}
        styles={{
          height: areaCanvasHeight,
          width: labelWidth,
          fontSize: style?.fontSize,
        }}
        labelCount={5}
      />

      <Canvas
        style={{
          width: chartWidth,
          height: canvasHeight,
        }}
        onTouchStart={(event) =>
          touchHandler(event.nativeEvent.locationX, event.nativeEvent.locationY)
        }
      >
        {paths.map(({ path, points, color }, index) => {
          return (
            <Group key={index}>
              <Path path={path} color={color} />
              {style?.showPoints &&
                color &&
                points.map((points) => (
                  <Circle
                    key={`${points.x}-${points.y}`}
                    cx={points.x}
                    cy={points.y}
                    r={style?.pointRadius ?? 3}
                    color={lighten(color, style?.lightenPointsBy ?? 0.3)}
                  />
                ))}
            </Group>
          );
        })}
        {xLabelsData.map(({ label, xPosition }, index) => {
          return (
            <Text
              key={index}
              x={xPosition}
              y={canvasHeight}
              text={label}
              font={font}
              color={'white'}
            />
          );
        })}
      </Canvas>
      {touchLine && (
        <Popup
          popupData={touchLine.y.map((y, index) => ({
            x: touchLine.x,
            y: y,
            data: {
              rowIndex: index,
              colIndex: touchLine.col,
              value: touchLine.values[index]!,
            },
          }))}
          totalWidth={chartWidth + labelWidth + paddingHorizontal}
          totalHeight={canvasHeight}
          touchHandler={(x, y) => {
            console.log('Popup touchHandler', x, y);
            touchHandler(x - labelWidth - paddingLeft, y - paddingTop);
          }}
          viewOffset={viewOffset}
          popupStyle={popupStyle}
        />
      )}
    </View>
  );
}

export default AreaChart;
