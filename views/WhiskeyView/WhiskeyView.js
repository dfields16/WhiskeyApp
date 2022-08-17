import React from "react";
import { StyleSheet, Image, View, SafeAreaView } from "react-native";
import {
  VictoryGroup,
  VictoryArea,
  VictoryTheme,
  VictoryChart,
  VictoryAxis,
  VictoryPolarAxis,
} from "victory-native";

import {
  AppBar,
  HStack,
  IconButton,
  Text,
  Flex,
  Divider,
} from "@react-native-material/core";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

const sampleData = [
  { label: "Vanilla", value: 60 },
  { label: "Carmel", value: 72 },
  { label: "Smoke", value: 65 },
  { label: "Peat", value: 80 },
  { label: "Spice", value: 54 },
  { label: "Cherry", value: 70 },
  { label: "Hazelnut", value: 56 },
  { label: "Nutmeg", value: 64 },
  { label: "Fruit", value: 28 },
  { label: "Citrus", value: 58 },
  { label: "Herb", value: 25 },
  { label: "Malt", value: 52 },
  { label: "Sweet", value: 23 },
  { label: "Bitter", value: 50 },
  { label: "Syrup", value: 39 },
];

export default function App({ route, navigation }) {

	const { id } = route.params;

	console.log("Whiskey ID: " + id);

  return (
    <SafeAreaView>
      <AppBar
        title="Whiskey"
        leading={(props) => (
          <IconButton
            icon={(props) => <Icon name="menu" {...props} />}
            {...props}
          />
        )}
        trailing={(props) => (
          <HStack>
            <IconButton
              icon={(props) => <Icon name="magnify" {...props} />}
              {...props}
            />
          </HStack>
        )}
      />

      <Flex center direction="row" justifyContent="space-between" style={{ margin: 5 }}>
        <Text variant="h4">Balcones Peated</Text>
        <Image
          style={{ width: "20%", height: "20%", aspectRatio: 0.5 }}
          source={{
            uri: "https://images.barcodelookup.com/26152/261527911-1.jpg",
          }}
        />
      </Flex>
      <Divider style={{ marginBottom: 10 }}/>
      <View style={{ height: "100%", aspectRatio: 0.5 }}>
        <Text variant="h4">Tasting Notes:</Text>
        <VictoryChart
          polar
          theme={VictoryTheme.material}
          style={{ background: { fill: "transparent" } }}
        >
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
              data: { fillOpacity: 0.2, strokeWidth: 2, fill: "orange" },
              labels: { fill: "transparent" },
            }}
          />
        </VictoryChart>
      </View>
    </SafeAreaView>
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
