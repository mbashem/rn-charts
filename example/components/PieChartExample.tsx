import { Text, View } from 'react-native';

import { PieChart, type PieSlice } from '../../src';

import { ChartExampleSection, exampleStyles, popupText } from './shared';

const pieSlices: PieSlice[] = [
  { label: 'Stocks', value: 54, color: '#2563EB' },
  { label: 'Bonds', value: 24, color: '#16A34A' },
  { label: 'Cash', value: 14, color: '#F97316' },
  { label: 'Crypto', value: 8, color: '#DB2777' },
];

export function PieChartExample() {
  return (
    <ChartExampleSection title="PieChart">
      <PieChart
        slices={pieSlices}
        onSliceTouch={() => undefined}
        centerView={
          <View style={exampleStyles.pieCenter}>
            <Text style={exampleStyles.pieCenterValue}>100%</Text>
            <Text style={exampleStyles.pieCenterLabel}>Total</Text>
          </View>
        }
        popupStyle={{
          width: 116,
          height: 54,
          renderPopup: (slice: PieSlice) =>
            popupText(slice.label ?? 'Slice', `${slice.value}%`),
        }}
        style={{
          radius: 128,
          innerRadius: 62,
          innerColor: '#FFFFFF',
          interSliceGap: 0.02,
          padding: 10,
        }}
      />
    </ChartExampleSection>
  );
}
