import React from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";
import Message from "../components/Message";
import chatRoomData from "../assets/dummy-data/Chats";
import MessageInput from "../components/MessageInput";
import { useNavigation, useRoute } from "@react-navigation/core";

const ChatRoomScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  navigation.setOptions({ title: "oso" });
  return (
    <SafeAreaView style={styles.page}>
      <FlatList
        data={chatRoomData.messages}
        renderItem={({ item }) => <Message message={item} />}
        inverted
      />
      <MessageInput />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },
});

export default ChatRoomScreen;
