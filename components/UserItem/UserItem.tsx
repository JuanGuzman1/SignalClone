import { useNavigation } from "@react-navigation/core";
import React from "react";
import { Text, View, Image, Pressable } from "react-native";
import styles from "./styles";

export default function UserItem({ user }) {
  const navigation = useNavigation();

  const onPress = () => {
    //create a chat room
  };
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image
        style={styles.image}
        source={{
          uri: user.imageUri,
        }}
      />
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
        </View>
      </View>
    </Pressable>
  );
}
