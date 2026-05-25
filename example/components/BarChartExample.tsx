import { View } from 'react-native';

import { BarChart, type BarData, type StackValue } from '../../src';

import {
  ChartExampleSection,
  axisLabel,
  exampleStyles,
  popupText,
  type ChartExampleProps,
} from './shared';

const barData: BarData[] = [
  {
    label: 'Jan',
    values: [
      { id: 'equity', label: 'Equity', value: 42 },
      { id: 'cash', label: 'Cash', value: 18 },
    ],
  },
  {
    label: 'Feb',
    values: [
      { id: 'equity', label: 'Equity', value: 48 },
      { id: 'cash', label: 'Cash', value: 16 },
    ],
  },
  {
    label: 'Mar',
    values: [
      { id: 'equity', label: 'Equity', value: 38 },
      { id: 'cash', label: 'Cash', value: 24 },
    ],
  },
  {
    label: 'Apr',
    values: [
      { id: 'equity', label: 'Equity', value: 56 },
      { id: 'cash', label: 'Cash', value: 14 },
    ],
  },
  {
    label: 'May',
    values: [
      { id: 'equity', label: 'Equity', value: 50 },
      { id: 'cash', label: 'Cash', value: 20 },
    ],
  },
];

export function BarChartExample({ chartWidth }: ChartExampleProps) {
  return (
    <ChartExampleSection title="BarChart">
      <BarChart
        data={barData}
        colors={{
          equity: ['#2563EB', '#38BDF8'],
          cash: ['#F97316', '#FACC15'],
        }}
        maxValue={90}
        minValue={0}
        yLabels={[1, 0.75, 0.5, 0.25, 0]}
        xLabelView={(label) => axisLabel(label ?? '')}
        yLabelView={(percentage, min, max) =>
          axisLabel(String(Math.round(min + (max - min) * percentage)))
        }
        onSelectBarView={(stackValue) => (
          <View
            style={[
              exampleStyles.barSelection,
              {
                backgroundColor:
                  stackValue.id === 'cash' ? '#FDBA74' : '#93C5FD',
              },
            ]}
          />
        )}
        popupStyle={{
          width: 124,
          height: 54,
          renderPopup: (value: StackValue) =>
            popupText(value.label, value.value),
        }}
        style={{
          width: chartWidth,
          height: 220,
          barWidth: 32,
          barSpacing: 18,
          firstBarLeadingSpacing: 12,
          lastBarTrailingSpacing: 12,
          paddingTop: 8,
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
