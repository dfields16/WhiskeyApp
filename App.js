import React from "react";
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeView from "./views/Home";
import WhiskeyView from "./views/WhiskeyView";
import * as Views from './views/Views'


const Stack = createStackNavigator();

export default function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator screenOptions={{headerShown: false}} initialRouteName={Views.HomeView}>
				<Stack.Screen name={Views.HomeView}    component={HomeView} />
				<Stack.Screen name={Views.WhiskeyView} component={WhiskeyView} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
	},
});
