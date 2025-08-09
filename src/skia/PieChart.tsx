// PieChart.tsx
import { Canvas, Path, Skia, Text } from '@shopify/react-native-skia';
import { type CommonStyles, font, getRandomRGBColor } from './common';
import { View, type GestureResponderEvent } from 'react-native';
import type { TooltipData } from './Tooltip';
import { useState } from 'react';

type PieSlice = {
  value: number;
  color?: string;
  label?: string;
};

interface PieChartStyles extends CommonStyles {
  diameter?: number;
}

export type PieChartProps = {
  slices: PieSlice[];
  styles: PieChartStyles;
};

function PieChart({ slices, styles }: PieChartProps) {
  const [tooltip, setTooltip] = useState<TooltipData | undefined>(undefined);

  const diameter = styles.diameter ?? 300;
  const radius = diameter / 2;
  const cx = radius;
  const cy = radius;

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let startAngle = 0;

  const paths = slices.map(({ value, color }) => {
    const sweepAngle = (value / total) * 360;
    const startRad = (Math.PI / 180) * startAngle;
    const endRad = (Math.PI / 180) * (startAngle + sweepAngle);

    let x1 = cx + radius * Math.cos(startRad);
    let y1 = cy + radius * Math.sin(startRad);
    let x2 = cx + radius * Math.cos(endRad);
    let y2 = cy + radius * Math.sin(endRad);

    x1 = diameter - x1;
    y1 = diameter - y1;
    x2 = diameter - x2;
    y2 = diameter - y2;

    const path = Skia.Path.Make();
    path.moveTo(cx, cy);
    path.lineTo(x1, y1);
    path.arcToRotated(cx, cy, sweepAngle, sweepAngle < 180, false, x2, y2);
    path.lineTo(cx, cy);
    path.close();

    startAngle += sweepAngle;

    return { path, color: color ?? getRandomRGBColor() };
  });

  const onCanvasTouchStart = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    console.log('Touch at:', locationX, locationY);
    paths.forEach(({ path }, index) => {
      if (path.contains(locationX, locationY)) {
        const label = slices[index]!.label || 'Slice';
        console.log('Slice touched:', label);
        setTooltip({
          x: locationX,
          y: locationY,
          label: label,
        });
        return;
      }
    });
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Canvas
        style={{
          width: styles.diameter,
          height: styles.diameter,
          backgroundColor: 'gray',
        }}
        onTouchStart={onCanvasTouchStart}
      >
        {paths.map(({ path, color }, index) => (
          <Path key={index} path={path} color={color} />
        ))}
        <Text x={radius} y={radius} text={'F'} color="white" font={font} />
      </Canvas>
    </View>
  );
}

export default PieChart;
