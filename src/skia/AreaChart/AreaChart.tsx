// AreaChart.tsx
import { useMemo } from 'react';
import { Canvas, Path, Skia, type SkPath } from '@shopify/react-native-skia';
import type { CommonStyle } from '../common';
import VerticalLabel from '../Common/VerticalLabel';
import { View } from 'react-native';

interface AreaChartStyle extends CommonStyle {
  width: number;
  height: number;
  labelSize?: number;
}

interface AreaData {
  values: number[];
  label?: string;
  color?: string;
}

interface AreaChartProps {
  data: AreaData[];
  xLabels?: string[];
  style: AreaChartStyle;
}

interface PathData {
  path: SkPath;
  color?: string;
  label?: string;
}

function AreaChart({ data, style }: AreaChartProps) {
  const height = style.height;
  const width = style.width;
  const paddingTop = style.paddingTop ?? 0;
  const paddingBottom = style.paddingBottom ?? 0;
  const canvasHeight = height - paddingTop - paddingBottom;
  const labelWidth = 30;
  const chartWidth = width - labelWidth;

  const paths = useMemo(() => {
    const pathData: PathData[] = [];
    for (let datum of data) {
      const areaData = datum.values;
      const maxY = 100;
      const stepX = width / (areaData.length - 1);
      console.log(width, areaData.length);

      const p = Skia.Path.Make();

      p.moveTo(0, height);

      areaData.forEach((y, i) => {
        const xPos = i * stepX;
        const yPos = height - (y / maxY) * height;
        console.log('xPos, yPos: ', xPos, yPos);
        p.lineTo(xPos, yPos);
      });

      p.lineTo(width, height);
      p.close();

      pathData.push({ path: p, color: datum.color ?? 'blue', label: datum.label });
    }

    return pathData;
  }, [data]);
  console.log('Path: ', paths);
  console.log(
    'labelWidth: ',
    labelWidth,
    ' chartWidth: ',
    chartWidth,
    ' canvasHeight: ',
    canvasHeight
  );

  return (
    <View
      style={[
        style,
        { flexDirection: 'row', backgroundColor: style.backgroundColor },
      ]}
    >
      <VerticalLabel
        minValue={0}
        maxValue={100}
        styles={{
          height: canvasHeight,
          width: labelWidth,
          fontSize: style.labelSize,
          backgroundColor: style.backgroundColor,
        }}
        labelCount={5}
      />

      <Canvas
        style={{
          width: chartWidth,
          height: canvasHeight,
          backgroundColor: 'purple',
        }}
      >
        {paths.map(({ path, color }) => {
          return <Path path={path} color={color} />;
        })}
      </Canvas>
    </View>
  );
}

export default AreaChart;
