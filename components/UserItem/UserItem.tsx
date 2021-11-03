import { useNavigation } from "@react-navigation/core";
import React from "react";
import { Text, View, Image, Pressable } from "react-native";
import styles from "./styles";
import { ChatRoom, User, ChatRoomUser } from "../../src/models";
import { Auth, DataStore } from "aws-amplify";

export default function UserItem({ user }) {
  const navigation = useNavigation();

  const onPress = async () => {
    try {
      //create a chat room
      const newChatRoom = await DataStore.save(
        new ChatRoom({
          newMessages: 0,
        })
      );

      //connect the authenticated user with the chat room
      const authUser = await Auth.currentAuthenticatedUser();
      const dbUser = await DataStore.query(User, authUser.attributes.sub);

      await DataStore.save(
        new ChatRoomUser({
          user: dbUser,
          chatroom: newChatRoom,
        })
      );

      //connect the clicked user with the chat room
      await DataStore.save(
        new ChatRoomUser({
          user,
          chatroom: newChatRoom,
        })
      );

      navigation.navigate("ChatRoom", { id: newChatRoom.id });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image
        style={styles.image}
        source={{
          uri: user?.imageUri,
        }}
      />
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
      </View>
    </Pressable>
  );
}
