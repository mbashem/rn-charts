// AreaChart.tsx
import { Canvas, Circle, Group, Path, Text } from '@shopify/react-native-skia';
import { type CommonStyle, type VerticalLabelStyle } from '../common';
import { View } from 'react-native';
import useAreaChart from './useAreaChart';
import { useState } from 'react';
import { lighten } from '../../util/colors';
import Popup, { type PopupStyle } from '../Popup';
import VerticalLabelView from "../Common/VerticalLabelView";

export interface AreaData {
  values: number[];
  label?: string;
  color?: string;
}

export interface AreaChartStyle extends CommonStyle, VerticalLabelStyle {
  width: number;
  height: number;
  showPoints?: boolean;
  pointRadius?: number;
  lightenPointsBy?: number;
  strokeWidth?: number;
}

export interface AreaChartProps {
  data: AreaData[];
  minValue?: number;
  maxValue?: number;
  xLabels?: string[];
  yLabels: number[];
  yLabelView?: (percentage: number, min: number, max: number) => JSX.Element;
  style?: AreaChartStyle;
  popupStyle: PopupStyle<{ rowIndex: number; colIndex: number; value: number; }>;
}

function AreaChart({ yLabelView, ...props }: AreaChartProps) {
  const {
    minValue,
    maxValue,
    canvasHeight,
    areaCanvasHeight,
    verticalLabelWidth,
    strokeWidth,
    verticalLabelStrokeWidth,
    yLabels,
    setVerticalLabelWidth,
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
      {yLabelView &&
        <VerticalLabelView
          onLayout={(event) => {
            setVerticalLabelWidth(event.nativeEvent.layout.width);
          }}
          labelPercentages={yLabels}
          styles={{
            width: props.style?.yLabelWidth,
            height: areaCanvasHeight,
            strokeWidth: verticalLabelStrokeWidth,
            backgroundColor: props.style?.yLabelBackgroundColor
          }}
        >
          {percentage => yLabelView(percentage, minValue, maxValue)}
        </VerticalLabelView>
      }

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
          totalWidth={chartWidth + verticalLabelWidth + paddingHorizontal}
          totalHeight={canvasHeight}
          touchHandler={(x, y) => {
            console.log('Popup touchHandler', x, y);
            touchHandler(x - verticalLabelWidth - paddingLeft, y - paddingTop);
          }}
          viewOffset={viewOffset}
          popupStyle={popupStyle}
        />
      )}
    </View>
  );
}

export default AreaChart;
