import React from "react";
import {
  StyleSheet,
  Image,
  View,
  SafeAreaView,
  ScrollView,
} from "react-native";
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
  Avatar,
} from "@react-native-material/core";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

import { ListItem } from "@react-native-material/core";
import * as Views from '../Views'

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

export default function Home({ navigation }) {
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

      <ScrollView height="100%">
        <ListItem
          leadingMode="avatar"
          leading={
            <Image
              style={{ width: "100%", height: "100%", aspectRatio: .75 }}
              source={{
                uri: "https://images.barcodelookup.com/26152/261527911-1.jpg",
              }}
            />
          }
          title="Balcones Peated"
          trailing={(props) => <Icon name="chevron-right" {...props} />}
			 onPress={() => navigation.navigate(Views.WhiskeyView, {id: 1})}
        />
      </ScrollView>
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
