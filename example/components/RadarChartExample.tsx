import { RadarChart, type RadarDatum } from '../../src';

import { ChartExampleSection, type ChartExampleProps } from './shared';

const radarData: RadarDatum[] = [
  {
    values: [82, 74, 88, 69, 77],
    backgroundColor: 'rgba(37, 99, 235, 0.24)',
    strokeColor: '#2563EB',
    strokeWidth: 2,
  },
  {
    values: [58, 86, 65, 91, 70],
    backgroundColor: 'rgba(22, 163, 74, 0.18)',
    strokeColor: '#16A34A',
    strokeWidth: 2,
  },
];

export function RadarChartExample({ chartWidth }: ChartExampleProps) {
  const radarSize = Math.min(chartWidth, 320);

  return (
    <ChartExampleSection title="RadarChart">
      <RadarChart
        data={radarData}
        labels={['Growth', 'Risk', 'Income', 'Fees', 'Quality']}
        levels={5}
        maxValue={100}
        minValue={0}
        style={{
          size: radarSize,
          strokeWidth: 1,
          strokeColor: '#CBD5E1',
          centerDotRadius: 3,
          centerDotColor: '#334155',
        }}
      />
    </ChartExampleSection>
  );
}
