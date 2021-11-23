import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import MainScreen from "./app/MainScreen";
import DetailsScreen from "./app/DetailsScreen";

export default function App() {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        <Stack.Screen name="MainScreen" component={MainScreen} />
        <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
