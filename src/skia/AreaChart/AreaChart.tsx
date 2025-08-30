// AreaChart.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import VerticalLabel from '../Common/VerticalLabel';

interface AreaData {
  values: number[];
  label?: string;
}

interface AreaChartProps {
  data: AreaData[];
  xLabels?: string[];
  width: number;
  height: number;
  color?: string;
  durationMs?: number;
}

function AreaChart({
  data,
  width,
  height,
  color = 'rgba(59,130,246,0.5)', // Tailwind blue-500 with alpha
  durationMs = 800,
}: AreaChartProps) {
  const [progress, setProgress] = useState(0);

  // useEffect(() => {
  //   // Animate from 0 → 1 whenever data changes
  //   runTiming(progress, 1, {
  //     duration: durationMs,
  //     easing: Easing.inOut(Easing.cubic),
  //   });
  // }, [data, durationMs]);

  const path = useMemo(() => {
    if (data.length === 0) return Skia.Path.Make();

    // const maxY = Math.max(...data);
    const maxY = 100;
    const stepX = width / (data.length - 1);

    const p = Skia.Path.Make();
    // Start at bottom-left
    p.moveTo(0, height);

    // p.lineTo(width / 2, height / 2);
    // p.lineTo(width / 2 + 60, height / 2);
    data.forEach((y, i) => {
      const xPos = i * stepX;
      const yNorm = height - (10 / maxY) * height;
      p.lineTo(xPos, yNorm);
    });

    // Close to bottom-right
    p.lineTo(width, height);
    p.close();

    return p;
  }, [data, progress]);

  return (
    <View>
      <VerticalLabel
        minValue={0}
        maxValue={100}
        styles={{ height: height, width: 30 }}
        labelCount={5}
      />
      <Canvas style={{ width, height }}>
        <Path path={path} color={color} />
      </Canvas>
    </View>
  );
}

export default AreaChart;
