import { Text, View } from 'react-native';

import { HeatMap, type CellDatum, type HeatMapDataGroup } from '../../src';

import {
  ChartExampleSection,
  axisLabel,
  exampleStyles,
  popupText,
} from './shared';

const heatMapData: HeatMapDataGroup[] = [
  {
    cols: 4,
    startingRow: 0,
    endingRow: 6,
    data: {
      0: { 0: 2, 1: 8, 2: 4, 3: 12 },
      1: { 0: 5, 1: 11, 2: 7, 3: 16 },
      2: { 0: 14, 1: 6, 2: 10, 3: 18 },
      3: { 0: 3, 1: 15, 2: 8, 3: 20 },
      4: { 0: 9, 1: 13, 2: 17, 3: 11 },
      5: { 0: 6, 1: 19, 2: 12, 3: 15 },
      6: { 0: 4, 1: 10, 2: 21, 3: 14 },
    },
  },
  {
    cols: 3,
    startingRow: 0,
    endingRow: 6,
    data: {
      0: { 0: 7, 1: 13, 2: 9 },
      1: { 0: 17, 1: 5, 2: 11 },
      2: { 0: 12, 1: 20, 2: 15 },
      3: { 0: 8, 1: 16, 2: 22 },
      4: { 0: 14, 1: 9, 2: 18 },
      5: { 0: 11, 1: 23, 2: 19 },
      6: { 0: 6, 1: 15, 2: 24 },
    },
  },
];

export function HeatMapExample() {
  return (
    <ChartExampleSection title="HeatMap">
      <HeatMap
        rows={7}
        data={heatMapData}
        maxValue={24}
        minValue={0}
        xLabelView={(index, labelWidth) => (
          <Text style={[exampleStyles.axisLabel, { width: labelWidth }]}>
            W{index + 1}
          </Text>
        )}
        yLabelView={(index) =>
          axisLabel(['M', 'T', 'W', 'T', 'F', 'S', 'S'][index] ?? '')
        }
        onSelectView={() => <View style={exampleStyles.heatSelection} />}
        popupStyle={{
          width: 112,
          height: 54,
          renderPopup: (datum: CellDatum) =>
            popupText(
              `R${datum.rowIndex + 1} C${datum.colIndex + 1}`,
              datum.value
            ),
        }}
        style={{
          cellSize: 24,
          cellGap: 5,
          cellMinColor: '#DCFCE7',
          cellMaxColor: '#15803D',
          interGroupSpacing: 14,
          paddingTop: 8,
          verticalLabelStyle: {
            width: 26,
          },
          horizontalLabelStyle: {
            height: 28,
          },
        }}
      />
    </ChartExampleSection>
  );
}
