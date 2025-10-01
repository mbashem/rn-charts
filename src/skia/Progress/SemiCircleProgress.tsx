import { View } from 'react-native';
import {
  Canvas,
  LinearGradient,
  RoundedRect,
} from '@shopify/react-native-skia';
import type { CommonStyle } from '../common';

export interface SemiCircleProgressStyles extends CommonStyle {
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

export interface SemiCircleProgressProps {
  style: SemiCircleProgressStyles;
  progress: number;
}

export default function SemiCircleProgress({
  progress,
  style,
}: SemiCircleProgressProps) {
  const width = style.width ?? 300;
  const height = style.height ?? 20;
  const radius = style.radius ?? 0;
  const tintColor = style.tintColor ?? '#4A90E2';

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
