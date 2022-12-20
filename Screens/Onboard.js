import { SafeAreaView, View, Text, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { RectButton } from "react-native-gesture-handler";
import * as SQLite from "expo-sqlite";
import { useEffect } from "react";

const { width, height } = Dimensions.get("screen");

export default function Onboard({ navigation }) {
  const db = SQLite.openDatabase("steptracker");

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS steps (id INTEGER PRIMARY KEY AUTOINCREMENT, month TEXT, day TEXT, steps TEXT)"
      );
    });
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: height * 0.05,
        backgroundColor: "white",
        position: "relative",
        height,
        width,
      }}
    >
      <View
        style={{
          borderRadius: width * 3,
          position: "absolute",
          top: height * 0.08,
          left: width * 0.05,
          width: width * 3,
          height: width * 3,
          backgroundColor: "#540375",
          zIndex: -10,
        }}
      ></View>
      <StatusBar style="dark" />
      <Text onPress={() => navigation.navigate("Main")}>
        <RectButton
          style={{
            paddingHorizontal: width * 0.2,
            paddingVertical: height * 0.01,
            backgroundColor: "#FF7000",
            borderRadius: 12,
          }}
        >
          <View>
            <Text style={{ fontSize: 24, color: "white" }}>Get started</Text>
          </View>
        </RectButton>
      </Text>
    </SafeAreaView>
  );
}
