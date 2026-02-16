import { Fragment, useState } from 'react';
import { View } from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Canvas, Rect, vec, Line } from '@shopify/react-native-skia';

import { type CommonStyle } from '../common';
import useBarChart from './useBarChart';
import Popup, { type PopupStyle } from '../Popup';
import VerticalLabelView, { type VerticalLabelStyle } from "../Common/VerticalLabelView";
import HorizontalLabelView from "../Common/HorizontalLabelView";

export interface StackValue {
  value: number;
  label: string;
  id?: string;
}

export interface BarData {
  values: StackValue[];
  label?: string;
}

export interface BarChartStyle extends CommonStyle, VerticalLabelStyle {
  width?: number;
  height?: number;
  barWidth?: number;
  barSpacing?: number;
  firstBarLeadingSpacing?: number;
  lastBarTrailingSpacing?: number;
  strokeWidth?: number;
}

export interface BarChartProps {
  data: BarData[];
  colors?: Record<string, string>;
  yLabels: number[];
  yLabelView?: (percentage: number, min: number, max: number) => JSX.Element;
  xLabelView?: (label?: string) => JSX.Element;
  maxValue?: number;
  minValue?: number;
  popupStyle?: PopupStyle<StackValue>;
  style?: BarChartStyle;
}

function BarChart({ xLabelView, yLabelView, ...props }: BarChartProps) {
  const {
    maxValueCalculated,
    minValueCalculated,
    yLabels,
    canvasWidth,
    paddingRight,
    paddingLeft,
    paddingBottom,
    paddingTop,
    rectangles,
    verticalLabelWidth,
    setVerticalLabelWidth,
    chartHeight,
    strokeWidth,
    tooltip,
    bottomLabelHeight,
    setBottomLabelHeight,
    onScroll,
    touchHandler,
    totalHeight,
    totalWidth,
  } = useBarChart(props);

  const dragGesture = Gesture.Pan()
    .runOnJS(true)
    .onChange((event) => {
      onScroll(-event.changeX);
    });

  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });

  return (
    <GestureHandlerRootView>
      <View
        style={{
          width: totalWidth,
          flexDirection: 'column',
          backgroundColor: props.style?.backgroundColor,
          paddingStart: paddingLeft,
          paddingEnd: paddingRight,
          paddingTop: paddingTop,
          paddingBottom: paddingBottom,
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
        <View style={{ flexDirection: "row", height: chartHeight, backgroundColor: "red" }}>
          {
            yLabelView && (<VerticalLabelView
              onLayout={(event) => {
                setVerticalLabelWidth(event.nativeEvent.layout.width);
              }}
              labelPercentages={yLabels}
              styles={{
                width: props.style?.yLabelWidth,
                height: chartHeight,
                strokeWidth,
                backgroundColor: props.style?.yLabelBackgroundColor
              }}
            >
              {percentage => yLabelView(percentage, minValueCalculated, maxValueCalculated)}
            </VerticalLabelView>)
          }
          <GestureDetector gesture={dragGesture}>
            <Canvas
              style={{
                width: canvasWidth,
                height: chartHeight,
              }}
              onTouchStart={(event) =>
                touchHandler(
                  event.nativeEvent.locationX,
                  event.nativeEvent.locationY
                )
              }
            >
              {/* X axis */}
              <Line
                p1={vec(0, chartHeight)}
                p2={vec(canvasWidth, chartHeight)}
                color="white"
                strokeWidth={strokeWidth}
              />

              {/* Bars */}

              {rectangles.map((bar, xIndex) => {
                if (bar.bars.length === 0) return null;
                return (
                  <Fragment key={xIndex}>
                    {bar.bars.map((item, yIndex) => {
                      let currentData = props.data[xIndex]!.values[yIndex]!;
                      let color =
                        props?.colors?.[currentData.id ?? currentData.label] ||
                        '#4A90E2';
                      return (
                        <Rect
                          key={xIndex + '-' + yIndex}
                          x={item.x}
                          y={item.y}
                          width={item.width}
                          height={item.height}
                          color={color}
                        />
                      );
                    })}
                  </Fragment>
                );
              })}
            </Canvas>
          </GestureDetector>
        </View>
        {
          xLabelView &&
          <HorizontalLabelView
            labels={rectangles.map(bar => bar.label)}
            positions={rectangles.map(bar => bar.x)}
            styles={{
              left: verticalLabelWidth,
              width: canvasWidth,
            }}
            onLayout={(event) => setBottomLabelHeight(event.nativeEvent.layout.height)}
          >
            {label => xLabelView(label)}
          </HorizontalLabelView>
        }
        {tooltip && (
          <Popup
            popupData={{
              x: tooltip.centerX,
              y: tooltip.centerY,
              data: tooltip.data,
            }}
            popupStyle={props.popupStyle}
            totalWidth={totalWidth}
            totalHeight={totalHeight}
            touchHandler={(x, y) => {
              touchHandler(x - verticalLabelWidth - paddingLeft, y);
            }}
            viewOffset={viewOffset}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

export default BarChart;
