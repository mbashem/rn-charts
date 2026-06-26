import { ScrollView, Text, View, useWindowDimensions } from "react-native";

import {
  AreaChartExample,
  BarChartExample,
  HeatMapExample,
  PieChartExample,
  RadarChartExample,
} from "../components";
import { exampleStyles } from "../components/shared";

export default function ChartsExampleScreen() {
  const { width } = useWindowDimensions();
  const chartWidth = Math.min(Math.max(width - 32, 300), 390);

  return (
    <View style={exampleStyles.container}>
      <ScrollView contentContainerStyle={exampleStyles.content}>
        <Text style={exampleStyles.title}>rn-charts</Text>

        <AreaChartExample chartWidth={chartWidth} />
        <BarChartExample chartWidth={chartWidth} />
        <HeatMapExample />
        <PieChartExample />
        <RadarChartExample chartWidth={chartWidth} />
      </ScrollView>
    </View>
  );
}
