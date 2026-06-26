import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface ChartExampleSectionProps {
  title: string;
  children: ReactNode;
}

export interface ChartExampleProps {
  chartWidth: number;
}

export function ChartExampleSection({
  title,
  children,
}: ChartExampleSectionProps) {
  return (
    <View style={exampleStyles.section}>
      <Text style={exampleStyles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export const axisLabel = (value: string) => (
  <Text style={exampleStyles.axisLabel}>{value}</Text>
);

export const popupText = (title: string, value: string | number) => (
  <View style={exampleStyles.popup}>
    <Text style={exampleStyles.popupTitle} numberOfLines={1}>
      {title}
    </Text>
    <Text style={exampleStyles.popupValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

export const exampleStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    alignItems: "center",
    gap: 18,
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  title: {
    alignSelf: "flex-start",
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "800",
  },
  section: {
    width: "100%",
    alignItems: "center",
    borderColor: "#E2E8F0",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  sectionTitle: {
    alignSelf: "flex-start",
    color: "#1E293B",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  axisLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  popup: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    borderColor: "#CBD5E1",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
  },
  popupTitle: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
  },
  popupValue: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },
  barSelection: {
    flex: 1,
    opacity: 0.28,
  },
  heatSelection: {
    width: 24,
    height: 24,
    borderColor: "#0F172A",
    borderRadius: 4,
    borderWidth: 2,
  },
  pieCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  pieCenterValue: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
  },
  pieCenterLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "700",
  },
});
