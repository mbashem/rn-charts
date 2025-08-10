// PieChart.tsx
import { Canvas, Path, Skia, Text } from '@shopify/react-native-skia';
import { type CommonStyles, font, getRandomRGBColor } from './common';
import { View, type GestureResponderEvent } from 'react-native';
import type { TooltipData } from './Tooltip';
import { useState } from 'react';
import ToolTip from './Tooltip';

type PieSlice = {
  value: number;
  color?: string;
  label?: string;
};

interface PieChartStyles extends CommonStyles {
  diameter?: number;
  innerRadius?: number;
  innerColor?: string;
}

export type PieChartProps = {
  slices: PieSlice[];
  styles: PieChartStyles;
};

function getCircularPoints(
  startAngle: number,
  radius: number,
  angle: number,
  cx: number,
  cy: number,
  diameter: number
): [number, number, number, number] {
  const startRad = (Math.PI / 180) * startAngle;
  const endRad = (Math.PI / 180) * (startAngle + angle);

  let x1 = cx + radius * Math.cos(startRad);
  let y1 = cy + radius * Math.sin(startRad);
  let x2 = cx + radius * Math.cos(endRad);
  let y2 = cy + radius * Math.sin(endRad);

  return [diameter - x1, diameter - y1, diameter - x2, diameter - y2];
}

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

    let [x1, y1, x2, y2] = getCircularPoints(
      startAngle,
      radius,
      sweepAngle,
      cx,
      cy,
      diameter
    );
    let [cx1, cy1, cx2, cy2] = getCircularPoints(
      startAngle,
      styles.innerRadius ?? 0,
      sweepAngle,
      cx,
      cy,
      diameter
    );

    console.log('x1, y1, x2, y2:', x1, y1, x2, y2);
    console.log('cx1, cy1, cx2, cy2:', cx1, cy1, cx2, cy2);

    const path = Skia.Path.Make();
    path.moveTo(cx1, cy1);
    path.lineTo(x1, y1);
    path.arcToRotated(cx, cy, sweepAngle, sweepAngle < 180, false, x2, y2);
    path.lineTo(cx2, cy2);
    // path.arcToRotated(cx, cy, sweepAngle, sweepAngle < 180, false, cx1!, cy2!);

    // path.moveTo(cx, cy);
    // path.lineTo(cx1, cy1);
    // path.arcToRotated(cx, cy, sweepAngle, sweepAngle < 180, false, cx2, cy2);
    // path.lineTo(cx, cy);
    // path.close();

    startAngle += sweepAngle;

    return { path, color: color ?? getRandomRGBColor() };
  });

  const onCanvasTouchStart = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    console.log('Touch at:', locationX, locationY);
    let foundPath = false;

    paths.forEach(({ path }, index) => {
      if (path.contains(locationX, locationY)) {
        const label = slices[index]!.label || 'Slice';
        const bounds = path.getBounds();
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        console.log('Bounds: ', bounds);
        console.log('Slice touched:', label, ' at', centerX, centerY);
        setTooltip({
          centerX: centerX,
          centerY: centerY,
          label: label,
        });
        foundPath = true;
        return;
      }
    });

    if (!foundPath) {
      console.log('No slice found at touch location');
      setTooltip(undefined);
    }
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
        <ToolTip data={tooltip} />
      </Canvas>
    </View>
  );
}

export default PieChart;
