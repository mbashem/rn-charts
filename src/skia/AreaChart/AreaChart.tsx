// AreaChart.tsx
import { Canvas, Circle, Group, Path } from '@shopify/react-native-skia';
import { type CommonStyle } from '../common';
import { View } from 'react-native';
import useAreaChart from './useAreaChart';
import { useState } from 'react';
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
  showPoints?: boolean;
  pointRadius?: number;
  lightenPointsBy?: number;
  strokeWidth?: number;
  verticalLabelStyle?: VerticalLabelStyle;
  horizontalLabelStyle?: HorizontalLabelStyle;
}

export interface AreaChartProps {
  data: AreaData[];
  minValue?: number;
  maxValue?: number;
  xLabels?: string[];
  yLabels: number[];
  yLabelView?: (percentage: number, min: number, max: number) => JSX.Element;
  xLabelView?: (label?: string) => JSX.Element;
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
    verticalLabelStrokeWidth,
    yLabels,
    setVerticalLabelWidth,
    setHorizontalLabelHeight,
    chartWidth,
    paths,
    xLabelsData,
    paddingLeft,
    paddingTop,
    paddingHorizontal,
    touchLine,
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
      <View style={{ flexDirection: "row" }}>
        {yLabelView &&
          <VerticalLabelView
            onLayout={(event) => {
              setVerticalLabelWidth(event.nativeEvent.layout.width);
            }}
            labelPercentages={yLabels}
            styles={{
              height: areaCanvasHeight,
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
          }}
          onLayout={(event) => setHorizontalLabelHeight(event.nativeEvent.layout.height)}
        >
          {label => xLabelView(label)}
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
