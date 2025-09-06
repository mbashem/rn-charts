import React, { useState, useEffect } from 'react';
import { View, Button, useWindowDimensions } from 'react-native';
import {
  Canvas,
  LinearGradient,
  Rect,
  RoundedRect,
} from '@shopify/react-native-skia';
import type { CommonStyle } from '../common';

export interface LinearProgressStyles extends CommonStyle {
  width?: number;
  height?: number;
  radius?: number;
  tintColor?: string;
  backgroundColor?: string;
  tintColors?: string[];
  tineColorsPositions?: number[];
  backgroundColors?: string[];
  backgroundColorsPositions?: number[];
}

export interface LinearProgressProps {
  style: LinearProgressStyles;
  progress: number; // value between 0 and 1
}

export default function LinearProgress({
  progress,
  style,
}: LinearProgressProps) {
  const width = style.width ?? 300;
  const height = style.height ?? 20;
  const radius = style.radius ?? 0;
  const tintColor = style.tintColor ?? '#4A90E2';

  // Animate progress
  useEffect(() => {
    // runTiming(progress, 0.7, { duration: 1000 }); // progress to 70%
  }, []);

  return (
    <View
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        console.log('Layout width, height:', width, height);
      }}
    >
      <Canvas style={{ width, height }}>
        {/* Background bar */}
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={height}
          r={radius}
          color={style.backgroundColor}
        >
          {style.backgroundColors && (
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: width, y: 0 }}
              colors={style.backgroundColors}
							positions={style.backgroundColorsPositions}
            />
          )}
        </RoundedRect>
        {/* Foreground progress */}
        <RoundedRect
          x={0}
          y={0}
          width={progress * width} // animate width
          height={height}
          r={radius}
          color={style.tintColor}
        >
          {style.tintColors && (
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: width, y: 0 }}
              colors={style.tintColors}
              positions={style.tineColorsPositions}
            />
          )}
        </RoundedRect>
      </Canvas>
    </View>
  );
}
