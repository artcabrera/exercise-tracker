import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const RootStack = createNativeStackNavigator();

import Onboard from "./Screens/Onboard";
import Main from "./Screens/Main";
import PastSteps from "./Screens/PastSteps";

export default function App() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Onboard" component={Onboard} />
        <RootStack.Screen name="Main" component={Main} />
        <RootStack.Screen name="PastSteps" component={PastSteps} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
