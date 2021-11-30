import React from "react";
import { Text, View, Image, Pressable } from "react-native";
import styles from "./styles";
import { ChatRoom, User, ChatRoomUser } from "../../src/models";
import { Auth, DataStore } from "aws-amplify";
import { Feather } from "@expo/vector-icons";

export default function UserItem({
  user,
  onPress,
  onLongPress,
  isSelected,
  isAdmin = false,
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.container}
    >
      <Image
        style={styles.image}
        source={{
          uri: user?.imageUri,
        }}
      />
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user?.name}</Text>
          {isAdmin && <Text>admin</Text>}
        </View>
      </View>
      {isSelected !== undefined && (
        <Feather
          name={isSelected ? "check-circle" : "circle"}
          size={20}
          color="grey"
        />
      )}
    </Pressable>
  );
}
