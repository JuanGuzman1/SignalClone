import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Pressable, SafeAreaView } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import UserItem from "../components/UserItem";
import { Auth, DataStore } from "aws-amplify";
import { ChatRoom, User, ChatRoomUser } from "../src/models";
import NewGroupButton from "../components/NewGroupButton";
import { useNavigation } from "@react-navigation/core";

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const navigation = useNavigation();

  const createChatRoom = async (users) => {
    try {
      //connect the authenticated user with the chat room
      const authUser = await Auth.currentAuthenticatedUser();
      const dbUser = await DataStore.query(User, authUser.attributes.sub);

      const newChatRoomData = {
        newMessages: 0,
        admin: dbUser,
      };
      if (users.length > 1) {
        newChatRoomData.name = "New group";
        newChatRoomData.imageUri =
          "https://www.creativefabrica.com/wp-content/uploads/2019/02/Group-Icon-by-Kanggraphic.jpg";
      }
      //create a chat room
      const newChatRoom = await DataStore.save(new ChatRoom(newChatRoomData));

      if (dbUser) {
        await DataStore.save(
          new ChatRoomUser({
            user: dbUser,
            chatroom: newChatRoom,
          })
        );
      }

      //connect the users with the chat room
      await Promise.all(
        users.map((user) =>
          DataStore.save(
            new ChatRoomUser({
              user,
              chatroom: newChatRoom,
            })
          )
        )
      );

      navigation.navigate("ChatRoom", { id: newChatRoom.id });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    DataStore.query(User).then(setUsers);
  }, []);

  const isUserSelected = (user) => {
    return selectedUsers.some((selectedUser) => selectedUser.id === user.id);
  };

  const onUserPress = async (user) => {
    if (isNewGroup) {
      if (isUserSelected(user)) {
        setSelectedUsers(
          selectedUsers.filter((selectedUser) => selectedUser.id !== user.id)
        );
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    } else {
      await createChatRoom([user]);
    }
  };

  const saveGroup = async () => {
    await createChatRoom(selectedUsers);
  };

  return (
    <SafeAreaView style={styles.page}>
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <UserItem
            user={item}
            onPress={() => onUserPress(item)}
            isSelected={isNewGroup ? isUserSelected(item) : undefined}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <NewGroupButton onPress={() => setIsNewGroup(!isNewGroup)} />
        )}
      />
      {isNewGroup && (
        <Pressable style={styles.button} onPress={saveGroup}>
          <Text style={styles.buttonText}>
            Save group ({selectedUsers.length})
          </Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },
  button: {
    backgroundColor: "#3777f0",
    margin: 10,
    padding: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
