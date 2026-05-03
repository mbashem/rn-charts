# rn-charts

Experimental React Native chart components powered by
`@shopify/react-native-skia`.

This package is still evolving and incomplete. The public API may change between releases, and
some charts are best treated as building blocks while the library matures.

## Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Shared Concepts](#shared-concepts)
- [BarChart](#barchart)
- [PieChart](#piechart)
- [AreaChart](#areachart)
- [RadarChart](#radarchart)
- [HeatMap](#heatmap)
- [Popups](#popups)
- [Known Limitations](#known-limitations)
- [Development](#development)

## Installation

Install the package and its React Native peer dependencies:

```sh
npm install @bashem/rn-charts @shopify/react-native-skia@2.2.12 react-native-gesture-handler@2.28.0 react-native-reanimated@4.1.1 react-native-worklets@0.5.1
```

The package peer ranges currently target:

| Peer | Version |
| --- | --- |
| `react` | `^19.1.0` |
| `react-native` | `^0.81.5` |
| `@shopify/react-native-skia` | `^2.2.12` |
| `react-native-gesture-handler` | `^2.28.0` |
| `react-native-reanimated` | `^4.1.1` |
| `react-native-worklets` | `^0.5.1` |

Follow the setup instructions for Skia, Gesture Handler, Reanimated, and
Worklets in your React Native app before rendering charts.

## Quick Start

```tsx
import { Text, View } from 'react-native';
import { BarChart } from '@bashem/rn-charts';

export function RevenueChart() {
  return (
    <BarChart
      data={[
        {
          label: 'Jan',
          values: [{ id: 'income', label: 'Income', value: 120 }],
        },
        {
          label: 'Feb',
          values: [{ id: 'income', label: 'Income', value: 180 }],
        },
      ]}
      yLabels={[1, 0.75, 0.5, 0.25, 0]}
      colors={{ income: '#2f855a' }}
      yLabelView={(percentage, min, max) => (
        <Text>{Math.round(percentage * (max - min) + min)}</Text>
      )}
      xLabelView={(label) => <Text>{label}</Text>}
      popupStyle={{
        width: 96,
        height: 40,
        renderPopup: (stackValue) => (
          <View style={{ padding: 8, backgroundColor: 'white' }}>
            <Text>{stackValue.value}</Text>
          </View>
        ),
      }}
      style={{
        width: 360,
        height: 220,
        barWidth: 28,
        barSpacing: 12,
        padding: 12,
      }}
    />
  );
}
```

In this repository, the package is also imported locally with:

```tsx
import { BarChart, PieChart } from '@/packages/rn-charts';
```

## Shared Concepts

### Common Style

Every chart style extends the shared `CommonStyle` fields:

| Prop | Type | Description |
| --- | --- | --- |
| `padding` | `number` | Default padding for all sides. |
| `paddingTop` | `number` | Top padding override. |
| `paddingBottom` | `number` | Bottom padding override. |
| `paddingStart` | `number` | Logical start padding. Respects RTL unless `disableRTL` is true. |
| `paddingEnd` | `number` | Logical end padding. Respects RTL unless `disableRTL` is true. |
| `paddingLeft` | `number` | Physical left padding override. |
| `paddingRight` | `number` | Physical right padding override. |
| `backgroundColor` | `string` | Chart container background color. |
| `disableRTL` | `boolean` | Disables RTL swapping for `paddingStart` and `paddingEnd`. |

### Label Positions

Several charts use `yLabels` as normalized positions from `0` to `1`, where
`0` is the bottom of the chart and `1` is the top. To display the actual value
for a label, convert the percentage with:

```ts
const value = percentage * (max - min) + min;
```

### Label Styles

Vertical labels use:

```ts
interface VerticalLabelStyle {
  width?: number;
  backgroundColor?: string;
  strokeWidth?: number;
  strokeColor?: string;
}
```

Horizontal labels use:

```ts
interface HorizontalLabelStyle {
  height?: number;
  backgroundColor?: string;
  strokeWidth?: number;
  strokeColor?: string;
  strokePosition?: 'top' | 'bottom';
}
```

Heat map horizontal labels additionally support:

```ts
interface HorizontalLabelStyleExtended extends HorizontalLabelStyle {
  viewPosition?: 'top' | 'bottom';
}
```

## BarChart

`BarChart` renders vertical stacked bars. It supports horizontal scrolling,
custom React labels, custom Skia rendering for bars, selected-bar overlays, and
popup content.

### Data

```ts
interface StackValue {
  value: number;
  label: string;
  id?: string;
}

interface BarData {
  values: StackValue[];
  label?: string;
}
```

Each `BarData` item is one x-axis group. Its `values` array is stacked from
bottom to top.

### Example

```tsx
import { Text, View } from 'react-native';
import { BarChart, type BarData } from '@bashem/rn-charts';

const data: BarData[] = [
  {
    label: 'Week 1',
    values: [
      { id: 'food', label: 'Food', value: 45 },
      { id: 'rent', label: 'Rent', value: 120 },
    ],
  },
  {
    label: 'Week 2',
    values: [
      { id: 'food', label: 'Food', value: 62 },
      { id: 'rent', label: 'Rent', value: 120 },
    ],
  },
];

export function ExpensesByWeek() {
  return (
    <BarChart
      data={data}
      yLabels={[1, 0.5, 0]}
      minValue={0}
      colors={{
        food: '#dd6b20',
        rent: ['#2b6cb0', '#63b3ed'],
      }}
      yLabelView={(percentage, min, max) => (
        <Text>{Math.round(percentage * (max - min) + min)}</Text>
      )}
      xLabelView={(label) => <Text>{label}</Text>}
      onSelectBarView={(stackValue) => (
        <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
      )}
      popupStyle={{
        width: 120,
        height: 48,
        renderPopup: (stackValue) => (
          <View style={{ padding: 8, backgroundColor: 'white' }}>
            <Text>{stackValue.label}</Text>
            <Text>{stackValue.value}</Text>
          </View>
        ),
      }}
      style={{
        width: 360,
        height: 220,
        barWidth: 32,
        barSpacing: 12,
        padding: 12,
        verticalLabelStyle: { width: 48, strokeWidth: 1 },
        horizontalLabelStyle: { height: 28, strokeWidth: 1 },
      }}
    />
  );
}
```

### Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `BarData[]` | Bar groups and stacked values. |
| `colors` | `Record<string, string \| string[]>` | Fill colors keyed by `StackValue.id` or `StackValue.label`. A string array creates a Skia gradient. |
| `yLabels` | `number[]` | Normalized y-axis label positions. |
| `yLabelView` | `(percentage, min, max) => JSX.Element` | React view renderer for y-axis labels. |
| `yLabelSkiaView` | `(percentage, yPosition) => JSX.Element \| undefined` | Skia renderer for y-axis labels. |
| `xLabelView` | `(label?: string) => JSX.Element` | React view renderer for x-axis labels. |
| `onSelectBarView` | `(stackValue, xLabel?) => JSX.Element \| undefined` | React overlay rendered inside the selected stack segment. |
| `barSkiaView` | `(rect, stackValue, xLabel?) => JSX.Element \| undefined` | Custom Skia renderer for each stack segment. Return `undefined` to use the default rectangle. |
| `onSelectBarSkiaView` | `(rect, stackValue, xLabel?) => JSX.Element \| undefined` | Skia overlay for the selected stack segment. |
| `maxValue` | `number` | Explicit chart maximum. Defaults to the largest stacked group sum. |
| `minValue` | `number` | Explicit chart minimum. Defaults to the smallest stack value. |
| `overscanRatio` | `number` | Extra horizontal render buffer for scrolling. Defaults to `0.5`. |
| `popupStyle` | `PopupStyle<StackValue>` | Popup renderer shown after tapping a stack segment. |
| `style` | `BarChartStyle` | Chart dimensions, spacing, padding, and label styles. |

### Style

| Prop | Type | Default |
| --- | --- | --- |
| `width` | `number` | Window width |
| `height` | `number` | `200` |
| `barWidth` | `number` | `100` |
| `barSpacing` | `number` | `0` |
| `firstBarLeadingSpacing` | `number` | `0` |
| `lastBarTrailingSpacing` | `number` | `barSpacing` |
| `verticalLabelStyle` | `VerticalLabelStyle` | - |
| `horizontalLabelStyle` | `HorizontalLabelStyle` | - |

## PieChart

`PieChart` renders a donut-style pie chart with optional rounded slice corners,
center content, slice touch handling, and popups.

### Data

```ts
type PieSlice = {
  value: number;
  color?: string;
  label?: string;
  radius?: number;
};
```

`radius` on a slice controls the rounded corner radius for that slice. Provide
explicit colors for stable visuals. Missing colors are generated randomly.

### Example

```tsx
import { Text, View } from 'react-native';
import { PieChart } from '@bashem/rn-charts';

export function PortfolioPie() {
  return (
    <PieChart
      slices={[
        { value: 45, color: '#2b6cb0', label: 'Stocks', radius: 12 },
        { value: 25, color: '#2f855a', label: 'Bonds', radius: 12 },
        { value: 30, color: '#dd6b20', label: 'Cash', radius: 12 },
      ]}
      centerView={<Text>Total</Text>}
      onSliceTouch={(slice) => {
        console.log(slice?.label);
      }}
      popupStyle={{
        width: 96,
        height: 40,
        renderPopup: (slice) => (
          <View style={{ padding: 8, backgroundColor: 'white' }}>
            <Text>{slice.label}</Text>
          </View>
        ),
      }}
      style={{
        radius: 130,
        innerRadius: 64,
        innerColor: 'white',
        interSliceGap: 8,
        padding: 16,
      }}
    />
  );
}
```

### Props

| Prop | Type | Description |
| --- | --- | --- |
| `slices` | `PieSlice[]` | Slice values and rendering options. |
| `style` | `PieChartStyles` | Radius, inner radius, gaps, padding, and colors. |
| `centerView` | `React.ReactNode` | React content placed inside the donut hole. |
| `centerSkiaView` | `(centerX, centerY, radius) => React.ReactNode` | Skia content rendered at the chart center. |
| `onSliceTouch` | `(slice: PieSlice \| undefined) => void` | Called when a slice is selected or when the touch is outside a slice. Required for slice hit testing and popups. |
| `popupStyle` | `PopupStyle<PieSlice>` | Popup renderer shown after selecting a slice. |

### Style

| Prop | Type | Default |
| --- | --- | --- |
| `startAngle` | `number` | `0` |
| `radius` | `number` | `150` |
| `innerRadius` | `number` | `100` |
| `innerColor` | `string` | `black` for `centerView` background |
| `interSliceGap` | `number` | `20` |

## AreaChart

`AreaChart` renders one or more filled area series. It supports y-axis labels,
x-axis labels, optional point markers, and popups for the touched x-axis column.

### Data

```ts
interface AreaData {
  values: number[];
  label?: string;
  color?: string;
}
```

All series should use the same number of values when touch popups are enabled.
For the visible y-axis labels, prefer whole-number formatting even when
`yLabels` uses fractional positions.

### Example

```tsx
import { Text, View } from 'react-native';
import { AreaChart } from '@bashem/rn-charts';

const formatYAxisValue = (percentage: number, min: number, max: number) => {
  const value = percentage * (max - min) + min;
  return Math.round(value).toLocaleString();
};

export function BalanceProjection() {
  return (
    <AreaChart
      data={[
        {
          label: 'Balance',
          color: '#2b6cb0',
          values: [100, 140, 190, 260, 340],
        },
        {
          label: 'Contributions',
          color: '#2f855a',
          values: [80, 120, 160, 200, 240],
        },
      ]}
      minValue={0}
      yLabels={[1, 0.75, 0.5, 0.25, 0]}
      xLabels={['2026', '2027', '2028', '2029', '2030']}
      yLabelView={(percentage, min, max) => (
        <Text>{formatYAxisValue(percentage, min, max)}</Text>
      )}
      xLabelView={(label) => <Text>{label}</Text>}
      popupStyle={{
        width: 112,
        height: 48,
        renderPopup: (point) => (
          <View style={{ padding: 8, backgroundColor: 'white' }}>
            <Text>{point.value}</Text>
          </View>
        ),
      }}
      style={{
        width: 360,
        height: 240,
        padding: 8,
        pointRadius: 3,
        verticalLabelStyle: { width: 52, strokeWidth: 1 },
        horizontalLabelStyle: { height: 28, strokeWidth: 1 },
      }}
    />
  );
}
```

### Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `AreaData[]` | Area series. |
| `minValue` | `number` | Explicit chart minimum. |
| `maxValue` | `number` | Explicit chart maximum. Defaults to the largest value plus `10`. |
| `xLabels` | `string[]` | Labels positioned along the x-axis. |
| `yLabels` | `number[]` | Normalized y-axis label positions. |
| `yLabelView` | `(percentage, min, max) => JSX.Element` | React view renderer for y-axis labels. |
| `xLabelView` | `(label?: string) => JSX.Element` | React view renderer for x-axis labels. |
| `popupStyle` | `PopupStyle<{ rowIndex: number; colIndex: number; value: number }>` | Popup renderer for touched points. |
| `style` | `AreaChartStyle` | Chart dimensions, padding, point, and label styles. |

### Style

| Prop | Type | Default |
| --- | --- | --- |
| `width` | `number` | `200` |
| `height` | `number` | `200` |
| `pointRadius` | `number` | `0` |
| `lightenPointsBy` | `number` | `0.3` |
| `verticalLabelStyle` | `VerticalLabelStyle` | - |
| `horizontalLabelStyle` | `HorizontalLabelStyle` | - |

## RadarChart

`RadarChart` renders one or more polygon series over a radial grid. It supports
plain text labels or custom React label views.

### Data

```ts
interface RadarDatum {
  values: number[];
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}
```

The number of axes is inferred from the first data item, `labels`, or
`labelViews`.

### Example

```tsx
import { Text } from 'react-native';
import { RadarChart } from '@bashem/rn-charts';

export function SkillsRadar() {
  return (
    <RadarChart
      data={[
        {
          values: [80, 90, 70, 65, 75],
          backgroundColor: 'rgba(43, 108, 176, 0.35)',
          strokeColor: '#2b6cb0',
          strokeWidth: 2,
        },
      ]}
      labelViews={[
        <Text>Design</Text>,
        <Text>Code</Text>,
        <Text>Testing</Text>,
        <Text>Ops</Text>,
        <Text>Docs</Text>,
      ]}
      levels={5}
      maxValue={100}
      style={{
        size: 280,
        strokeColor: '#a0aec0',
        strokeWidth: 1,
        centerDotRadius: 3,
        centerDotColor: '#2b6cb0',
      }}
    />
  );
}
```

### Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `RadarDatum[]` | Polygon series. |
| `labels` | `string[]` | Text labels for each axis. |
| `labelViews` | `ReactNode[]` | Custom React labels for each axis. |
| `levels` | `number` | Number of grid rings. Defaults to `5`. |
| `maxValue` | `number` | Explicit scale maximum. Defaults to the largest value. |
| `minValue` | `number` | Seed value for computed maximum. Defaults to `0`. |
| `style` | `RadarChartStyle` | Size, grid, and center dot style. |

### Style

| Prop | Type | Default |
| --- | --- | --- |
| `size` | `number` | `200` |
| `strokeWidth` | `number` | `2` |
| `strokeColor` | `string` | `gray` |
| `centerDotRadius` | `number` | `2` |
| `centerDotColor` | `string` | `strokeColor` or `gray` |

## HeatMap

`HeatMap` renders grouped rectangular cells. It is useful for calendar-like
activity grids or compact matrix visualizations.

### Data

```ts
type CellDatum = {
  rowIndex: number;
  colIndex: number;
  groupIndex: number;
  value: number;
  x: number;
  y: number;
};

interface HeatMapDataGroup {
  cols: number;
  startingRow: number;
  endingRow: number;
  data?: Record<number, Record<number, number>>;
}
```

`data` is keyed by row index, then by the group's local column index. Missing
cells render as `0`.

### Example

```tsx
import { Text, View } from 'react-native';
import { HeatMap } from '@bashem/rn-charts';

export function ActivityHeatMap() {
  return (
    <HeatMap
      rows={7}
      coalesceGroups
      data={[
        {
          cols: 4,
          startingRow: 0,
          endingRow: 6,
          data: {
            0: { 0: 1, 1: 3, 2: 4, 3: 2 },
            1: { 0: 0, 1: 2, 2: 5, 3: 1 },
          },
        },
      ]}
      xLabelView={(index) => <Text>{index + 1}</Text>}
      yLabelView={(index) => <Text>{index}</Text>}
      onSelectView={(_rect, cell) => (
        <View style={{ backgroundColor: 'rgba(0,0,0,0.08)' }}>
          <Text>{cell.value}</Text>
        </View>
      )}
      popupStyle={{
        width: 96,
        height: 48,
        renderPopup: (cell) => (
          <View style={{ padding: 8, backgroundColor: 'white' }}>
            <Text>
              {cell.rowIndex}, {cell.colIndex}
            </Text>
            <Text>{cell.value}</Text>
          </View>
        ),
      }}
      style={{
        cellSize: 20,
        cellGap: 4,
        cellMinColor: '#f7fafc',
        cellMaxColor: '#2f855a',
        padding: 12,
        verticalLabelStyle: { width: 32 },
        horizontalLabelStyle: { height: 24 },
      }}
    />
  );
}
```

### Props

| Prop | Type | Description |
| --- | --- | --- |
| `rows` | `number` | Number of rows in the grid. |
| `data` | `HeatMapDataGroup[]` | Grouped columns and cell values. |
| `coalesceGroups` | `boolean` | Allows adjacent groups to share columns when possible. Set `false` to force group breaks. |
| `style` | `HeatMapStyle` | Cell size, colors, spacing, padding, and label styles. |
| `minValue` | `number` | Explicit minimum for color intensity. |
| `maxValue` | `number` | Explicit maximum for color intensity. |
| `xLabelSkiaView` | `(index, rect) => JSX.Element \| undefined` | Custom Skia x-label renderer. |
| `yLabelSkiaView` | `(index, yPosition) => JSX.Element \| undefined` | Custom Skia y-label renderer. |
| `xLabelView` | `(index, width) => JSX.Element \| undefined` | React x-label renderer. |
| `yLabelView` | `(index) => JSX.Element \| undefined` | React y-label renderer. |
| `cellSkiaView` | `(rect, cell) => JSX.Element \| undefined` | Custom Skia cell renderer. Return `undefined` to use default coloring. |
| `onSelectSkiaView` | `(rect, cell) => JSX.Element \| undefined` | Skia overlay for the selected cell. |
| `onSelectView` | `(rect, cell) => JSX.Element \| undefined` | React overlay for the selected cell. |
| `ref` | `Ref<HandleOutSideTouch \| undefined>` | Imperative handle with `touchedOutside()`. |
| `popupStyle` | `PopupStyle<CellDatum>` | Popup renderer shown after selecting a cell. Also enables selection hit testing. |

### Style

| Prop | Type | Default |
| --- | --- | --- |
| `cellSize` | `number` | `24` |
| `cellGap` | `number` | `4` |
| `cellMaxColor` | `string` | `#50f555ff` |
| `cellMinColor` | `string` | `#ffffffff` |
| `horizontalLabelStyle` | `HorizontalLabelStyleExtended` | - |
| `verticalLabelStyle` | `VerticalLabelStyle` | - |
| `interGroupSpacing` | `number` | `0` |

## Popups

Interactive charts use a shared popup shape:

```ts
interface PopupStyle<T> {
  width?: number;
  height?: number;
  renderPopup?: (data: T) => React.ReactNode;
}
```

`renderPopup` is rendered inside a transparent React Native `Modal`. Provide
`width` and `height` when possible so the popup can be clamped inside the chart
bounds.

Popup payloads by chart:

| Chart | Payload |
| --- | --- |
| `BarChart` | `StackValue` |
| `PieChart` | `PieSlice` |
| `AreaChart` | `{ rowIndex: number; colIndex: number; value: number }` |
| `HeatMap` | `CellDatum` |

## Known Limitations

- The package is experimental and not ready for broad production use.
- Charts are currently built for React Native apps. Web support is not
  documented.
- `PieChart` needs `onSliceTouch` for touch selection and popups.
- `HeatMap` selection currently requires `popupStyle.renderPopup`.
- `AreaChart` touch popups assume each series has a value at the selected
  column.
- If a pie slice omits `color`, a random color is generated.

## Development

From `rn-app/packages/rn-charts`:

```sh
npm install
npm test
npm run typecheck
npm run lint
```

Run the example app through the package workspace:

```sh
npm run example
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the
repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
