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
  { label: "Vanilla", value: 75 },
  { label: "Carmel", value: 99 },
  { label: "Smoke", value: 55 },
  { label: "Spice", value: 100 },
  { label: "Cherry", value: 21 },
  { label: "Hazelnut", value: 52 },
  { label: "Nutmeg", value: 42 },
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
