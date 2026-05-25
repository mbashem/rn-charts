import { AreaChart, type AreaData } from '../../src';

import {
  ChartExampleSection,
  axisLabel,
  popupText,
  type ChartExampleProps,
} from './shared';

const areaData: AreaData[] = [
  {
    label: 'Balance',
    color: '#0F766E',
    values: [24, 32, 42, 49, 61, 74],
  },
  {
    label: 'Contributions',
    color: '#7C3AED',
    values: [10, 16, 23, 28, 35, 44],
  },
];

export function AreaChartExample({ chartWidth }: ChartExampleProps) {
  return (
    <ChartExampleSection title="AreaChart">
      <AreaChart
        data={areaData}
        maxValue={80}
        minValue={0}
        xLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
        yLabels={[1, 0.75, 0.5, 0.25, 0]}
        xLabelView={(label) => axisLabel(label ?? '')}
        yLabelView={(percentage, min, max) =>
          axisLabel(String(Math.round(min + (max - min) * percentage)))
        }
        popupStyle={{
          width: 132,
          height: 54,
          renderPopup: ({ rowIndex, colIndex, value }) =>
            popupText(
              areaData[rowIndex]?.label ?? `Series ${rowIndex + 1}`,
              `${areaData[rowIndex]?.values[colIndex] ?? value}`
            ),
        }}
        style={{
          width: chartWidth,
          height: 230,
          paddingTop: 8,
          pointRadius: 4,
          verticalLabelStyle: {
            width: 38,
            strokeWidth: 1,
            strokeColor: '#CBD5E1',
          },
          horizontalLabelStyle: {
            height: 28,
            strokeWidth: 1,
            strokeColor: '#CBD5E1',
          },
        }}
      />
    </ChartExampleSection>
  );
}
