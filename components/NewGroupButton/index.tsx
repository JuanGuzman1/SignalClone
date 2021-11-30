import React from "react";
import { View, Text, Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const NewGroupButton = ({ onPress }) => {
  return (
    <Pressable onPress={onPress}>
      <View style={{ flexDirection: "row", padding: 10, alignItems: "center" }}>
        <FontAwesome name="group" size={24} color="black" />
        <Text style={{ marginLeft: 10, fontWeight: "bold" }}>New group</Text>
      </View>
    </Pressable>
  );
};

export default NewGroupButton;
