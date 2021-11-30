import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import ChatRoomItem from "../components/ChatRoomItem";
import { FlatList } from "react-native-gesture-handler";
import { Auth, DataStore } from "aws-amplify";
import { ChatRoom, ChatRoomUser } from "../src/models";

export default function TabOneScreen() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      const userData = await Auth.currentAuthenticatedUser();
      const chatRooms = (await DataStore.query(ChatRoomUser))
        .filter(
          (chatRoomUser) => chatRoomUser.user.id === userData.attributes.sub
        )
        .map((chatRoomUser) => chatRoomUser.chatroom);
      setChatRooms(chatRooms);
    };
    fetchChatRooms();
  }, []);

  const logOut = async () => {
    await DataStore.clear();
    Auth.signOut();
  };

  return (
    <View style={styles.page}>
      <FlatList
        data={chatRooms}
        renderItem={({ item }) => <ChatRoomItem chatRoom={item} />}
        showsVerticalScrollIndicator={false}
      />
      <Pressable
        onPress={logOut}
        style={{
          backgroundColor: "red",
          height: 50,
          margin: 10,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 50,
        }}
      >
        <Text>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },
});
