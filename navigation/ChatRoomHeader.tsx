import React, { useEffect, useState } from "react";
import { View, Image, Text, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { DataStore, Auth } from "aws-amplify";
import { ChatRoomUser, User } from "../src/models";

const ChatRoomHeader = ({ id, children }) => {
  const { width } = useWindowDimensions();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    const fetchUsers = async () => {
      const fetchedUsers = (await DataStore.query(ChatRoomUser))
        .filter((chatRoomUser) => chatRoomUser.chatroom.id === id)
        .map((chatRoomUser) => chatRoomUser.user);
      const authUser = await Auth.currentAuthenticatedUser();
      setUser(
        fetchedUsers.find((user) => user.id !== authUser.attributes.sub) || null
      );
    };
    fetchUsers();
  }, []);

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
          uri: user?.imageUri,
        }}
        style={{ width: 30, height: 30, borderRadius: 30 }}
      />
      <Text style={{ flex: 1, marginLeft: 30, fontWeight: "bold" }}>
        {user?.name}
      </Text>
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
