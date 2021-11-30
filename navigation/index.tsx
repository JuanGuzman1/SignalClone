/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import {
  ColorSchemeName,
  Pressable,
  Text,
  View,
  Image,
  useWindowDimensions,
} from "react-native";

import NotFoundScreen from "../screens/NotFoundScreen";
import HomeScreen from "../screens/HomeScreen";
import { RootStackParamList } from "../types";
import LinkingConfiguration from "./LinkingConfiguration";
import ChatRoomScreen from "../screens/ChatRoomScreen";
import { Feather } from "@expo/vector-icons";
import UsersScreen from "../screens/UsersScreen";
import { useNavigation } from "@react-navigation/core";
import ChatRoomHeader from "./ChatRoomHeader";
import GroupInfoScreen from "../screens/GroupInfoScreen";

export default function Navigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerTitle: () => <HomeHeader /> }}
      />
      <Stack.Screen
        name="Users"
        component={UsersScreen}
        options={{
          title: "Users",
        }}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }) => ({
          headerTitle: () => <ChatRoomHeader id={route.params?.id} />,
          headerBackTitleVisible: false,
          // headerBackVisible: false,
        })}
      />
      <Stack.Screen name="GroupInfoScreen" component={GroupInfoScreen} />
      <Stack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: "Oops!" }}
      />
    </Stack.Navigator>
  );
}

const HomeHeader = (props) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width,
        padding: 10,
      }}
    >
      <Image
        source={{
          uri: "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/elon.png",
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <Text style={{ marginLeft: 40, fontWeight: "bold", textAlign: "center" }}>
        Signal
      </Text>
      <View style={{ flexDirection: "row" }}>
        <Feather
          name="camera"
          size={24}
          color="grey"
          style={{ marginHorizontal: 10 }}
        />
        <Pressable onPress={() => navigation.navigate("Users")}>
          <Feather
            name="edit-2"
            size={24}
            color="grey"
            style={{ marginHorizontal: 10 }}
          />
        </Pressable>
      </View>
    </View>
  );
};
