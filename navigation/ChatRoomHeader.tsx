import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { DataStore, Auth } from "aws-amplify";
import { ChatRoom, ChatRoomUser, User } from "../src/models";
import moment from "moment";
import { useNavigation } from "@react-navigation/core";

const ChatRoomHeader = ({ id, children }) => {
  const { width } = useWindowDimensions();
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoom | undefined>(undefined);
  const navigation = useNavigation();

  const fetchUsers = async () => {
    const fetchedUsers = (await DataStore.query(ChatRoomUser))
      .filter((chatRoomUser) => chatRoomUser.chatroom.id === id)
      .map((chatRoomUser) => chatRoomUser.user);
    setAllUsers(fetchedUsers);
    const authUser = await Auth.currentAuthenticatedUser();
    setUser(
      fetchedUsers.find((user) => user.id !== authUser.attributes.sub) || null
    );
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    fetchUsers();
    fetchChatRoom();
  }, []);

  const isGroup = () => {
    return allUsers.length > 2;
  };

  const fetchChatRoom = () => {
    DataStore.query(ChatRoom, id).then(setChatRoom);
  };

  const getLastOnlineText = () => {
    if (!user?.lastOnlineAt) {
      return;
    }
    //if lastOnlineAt is less than 5 minutes ago , show him online
    const lastOnlineDiffMS = moment().diff(moment(user?.lastOnlineAt));
    if (lastOnlineDiffMS < 5 * 60 * 1000) {
      //less than 5 minutes
      return "online";
    } else {
      return `Last seen ${moment(user.lastOnlineAt).fromNow()}`;
    }
  };

  const getUsernames = () => {
    return allUsers.map((user) => user.name).join(", ");
  };

  const openInfo = () => {
    navigation.navigate("GroupInfoScreen", { id });
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        width: width - 60,
        padding: 10,
        alignItems: "center",
        marginLeft: -15,
      }}
    >
      <Image
        source={{
          uri: chatRoom?.imageUri ? chatRoom.imageUri : user?.imageUri,
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <Pressable style={{ flex: 1, marginLeft: 30 }} onPress={openInfo}>
        <Text style={{ fontWeight: "bold" }}>
          {chatRoom?.name || user?.name}
        </Text>
        <Text numberOfLines={1}>
          {isGroup() ? getUsernames() : getLastOnlineText()}
        </Text>
      </Pressable>

      <View style={{ flexDirection: "row" }}>
        <Feather
          name="camera"
          size={24}
          color="grey"
          style={{ marginHorizontal: 10 }}
        />
        <Feather
          name="edit-2"
          size={24}
          color="grey"
          style={{ marginHorizontal: 10 }}
        />
      </View>
    </View>
  );
};

export default ChatRoomHeader;
