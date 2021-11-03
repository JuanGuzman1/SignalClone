import * as React from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import Users from "../assets/dummy-data/Users";
import { FlatList } from "react-native-gesture-handler";
import UserItem from "../components/UserItem";

export default function UsersScreen() {
  return (
    <View style={styles.page}>
      <FlatList
        data={Users}
        renderItem={({ item }) => <UserItem user={item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "white",
    flex: 1,
  },
});
