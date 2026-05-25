// AreaChart.tsx
import { Canvas, Circle, Group, Path } from '@shopify/react-native-skia';
import { type CommonStyle } from '../common';
import { View } from 'react-native';
import useAreaChart from './useAreaChart';
import { type ReactElement, useState } from 'react';
import { lighten } from '../../util/colors';
import Popup, { type PopupStyle } from '../Popup';
import VerticalLabelView, { type VerticalLabelStyle } from "../Common/VerticalLabelView";
import HorizontalLabelView, { type HorizontalLabelStyle } from "../Common/HorizontalLabelView";

export interface AreaData {
  values: number[];
  label?: string;
  color?: string;
}

export interface AreaChartStyle extends CommonStyle, VerticalLabelStyle {
  width: number;
  height: number;
  pointRadius?: number;
  lightenPointsBy?: number;
  verticalLabelStyle?: VerticalLabelStyle;
  horizontalLabelStyle?: HorizontalLabelStyle;
}

export interface AreaChartProps {
  data: AreaData[];
  minValue?: number;
  maxValue?: number;
  xLabels?: string[];
  yLabels: number[];
  yLabelView?: (percentage: number, min: number, max: number) => ReactElement;
  xLabelView?: (label?: string) => ReactElement;
  style?: AreaChartStyle;
  popupStyle: PopupStyle<{ rowIndex: number; colIndex: number; value: number; }>;
}

function AreaChart({ xLabelView, yLabelView, ...props }: AreaChartProps) {
  const {
    minValue,
    maxValue,
    canvasHeight,
    areaCanvasHeight,
    verticalLabelWidth,
    yLabels,
    setVerticalLabelWidth,
    setHorizontalLabelHeight,
    horizontalStrokeWidth,
    chartWidth,
    paths,
    xLabelsData,
    paddingLeft,
    paddingTop,
    paddingHorizontal,
    touchLine,
    pointRadius,
    touchHandler,
  } = useAreaChart(props);
  const { style, popupStyle } = props;

  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });

  return (
    <View
      style={[style, { flexDirection: "column" }]}
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
      <View style={{ flexDirection: "row", height: areaCanvasHeight }}>
        {yLabelView &&
          <VerticalLabelView
            onLayout={(event) => {
              setVerticalLabelWidth(event.nativeEvent.layout.width);
            }}
            labelPercentages={yLabels}
            styles={{
              height: areaCanvasHeight + horizontalStrokeWidth,
              verticalLabelStyle: props.style?.verticalLabelStyle,
            }}
          >
            {percentage => yLabelView(percentage, minValue, maxValue)}
          </VerticalLabelView>
        }

        <Canvas
          style={{
            width: chartWidth,
            height: areaCanvasHeight,
          }}
          onTouchStart={(event) =>
            touchHandler(event.nativeEvent.locationX, event.nativeEvent.locationY)
          }
        >
          {paths.map(({ path, points, color }, index) => {
            return (
              <Group key={index}>
                <Path path={path} color={color} />
                {pointRadius > 0 &&
                  color &&
                  points.map((points) => (
                    <Circle
                      key={`${points.x}-${points.y}`}
                      cx={points.x}
                      cy={points.y}
                      r={pointRadius}
                      color={lighten(color, style?.lightenPointsBy ?? 0.3)}
                    />
                  ))}
              </Group>
            );
          })}
        </Canvas>
      </View>
      {
        xLabelView &&
        <HorizontalLabelView
          labels={xLabelsData.map(labelData => labelData.label)}
          positions={xLabelsData.map(labelData => labelData.xPosition)}
          style={{
            left: verticalLabelWidth,
            width: chartWidth,
            horizontalLabelStyle: props.style?.horizontalLabelStyle,
          }}
          onLayout={(event) => setHorizontalLabelHeight(event.nativeEvent.layout.height)}
        >
          {label => xLabelView(label.toString())}
        </HorizontalLabelView>
      }
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
