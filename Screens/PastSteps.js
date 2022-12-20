import { SafeAreaView, View, Text, Dimensions, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { RectButton } from "react-native-gesture-handler";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";

const { width, height } = Dimensions.get("screen");

export default function PastSteps({ navigation, route }) {
  const db = SQLite.openDatabase("steptracker");
  const [dbRows, setDbRows] = useState([{}]);

  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM steps",
        null,
        (txObj, resultSet) => {
          setDbRows(resultSet.rows._array);
          console.log(dbRows);
        },
        (txObj, error) => console.log(error)
      );
    });
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "white",
        position: "relative",
        height,
        width,
      }}
    >
      <StatusBar style="dark" />
      <View
        style={{
          flex: 0.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width,
        }}
      >
        <Text
          style={{
            color: "#540375",
            fontSize: 48,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Wow! You completed {route.params.steps} steps!
        </Text>
      </View>
      <View
        style={{
          flex: 0.5,
          display: "flex",
          flexDirection: "column",
          width,
          paddingHorizontal: width * 0.01,
        }}
      >
        <ScrollView>
          {dbRows.map((item, index) => (
            <View
              key={index}
              style={{
                margin: 4,
                padding: 24,
                borderRadius: 8,
                display: "flex",
                flexDirection: "row",
                backgroundColor: "#540375",
              }}
            >
              <Text
                style={{
                  color: "white",
                }}
              >
                {Math.floor(item.month)}/{Math.floor(item.day)}
              </Text>
              <Text
                style={{
                  color: "white",
                  marginLeft: 24,
                }}
              >
                {Math.floor(item.steps)} steps
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
