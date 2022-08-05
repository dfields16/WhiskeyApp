import React from "react";
import { StyleSheet, View, Text } from "react-native";
import {
  VictoryGroup,
  VictoryArea,
  VictoryTheme,
  VictoryChart,
  VictoryAxis,
  VictoryPolarAxis,
} from "victory-native";

const sampleData = [
  { label: "Vanilla",  value: 60 },
  { label: "Carmel",   value: 35 },
  { label: "Smoke",    value: 37 },
  { label: "Spice",    value: 76 },
  { label: "Cherry",   value: 70 },
  { label: "Hazelnut", value: 56 },
  { label: "Nutmeg",   value: 64 },
  { label: "Fruit",    value: 28 },
  { label: "Citrus",   value: 58 },
  { label: "Herb",     value: 25 },
  { label: "Malt",     value: 52 },
  { label: "Sweet",    value: 23 },
  { label: "Bitter",   value: 50 },
  { label: "Syrup",    value: 39 },
];

export default function App() {
  return (
    <View style={styles.container}>
      <VictoryChart polar theme={VictoryTheme.material} style={{background: {fill: "transparent"}}}>
        <VictoryPolarAxis
          label="label"
          data={sampleData}
          labelPlacement="vertical"
          style={{
            axisLabel: { padding: 30 },
				data: { fill: "white" },
          }}

        />
        <VictoryArea
          x="label"
          y="value"
          data={sampleData}
          interpolation="cardinal"
          style={{
            data: { fillOpacity: 0.2, strokeWidth: 2, fill: "green" },
            labels: { fill: "transparent" },
          }}
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#312e4d",
  },
});
