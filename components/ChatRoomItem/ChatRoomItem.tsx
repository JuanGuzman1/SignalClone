import { useNavigation } from "@react-navigation/core";
import React, { useState, useEffect } from "react";
import { Text, View, Image, Pressable, ActivityIndicator } from "react-native";
import styles from "./styles";
import { DataStore, Auth } from "aws-amplify";
import { ChatRoomUser, Message, User } from "../../src/models";
import moment from "moment";

export default function ChatRoomItem({ chatRoom }) {
  const [user, setUser] = useState<User | null>(null); //the display user
  const [lastMessage, setLastMessage] = useState<Message | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = (await DataStore.query(ChatRoomUser))
        .filter((chatRoomUser) => chatRoomUser.chatroom.id === chatRoom.id)
        .map((chatRoomUser) => chatRoomUser.user);
      const authUser = await Auth.currentAuthenticatedUser();
      setUser(
        fetchedUsers.find((user) => user.id !== authUser.attributes.sub) || null
      );
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!chatRoom.chatRoomLastMessageId) {
      return;
    }
    DataStore.query(Message, chatRoom.chatRoomLastMessageId).then(
      setLastMessage
    );
  }, []);

  const onPress = () => {
    navigation.navigate("ChatRoom", { id: chatRoom.id });
  };

  if (isLoading) {
    return <ActivityIndicator style={{ flex: 1 }} color="grey" />;
  }

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image
        style={styles.image}
        source={{
          uri: chatRoom.imageUri || user?.imageUri,
        }}
      />
      {!!chatRoom.newMessages ? (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{chatRoom.newMessages}</Text>
        </View>
      ) : null}
      <View style={styles.rightContainer}>
        <View style={styles.row}>
          <Text style={styles.name}>{chatRoom.name || user?.name}</Text>
          <Text style={styles.text}>
            {moment(lastMessage?.createdAt).fromNow()}
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.text}>
          {lastMessage?.content}
        </Text>
      </View>
    </Pressable>
  );
}
