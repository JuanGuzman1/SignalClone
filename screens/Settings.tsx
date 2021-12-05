import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Auth, DataStore } from "aws-amplify";
import { generateKeyPair, PRIVATE_KEY } from "../utils/crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../src/models";

const Settings = () => {
  const logOut = async () => {
    await DataStore.clear();
    Auth.signOut();
  };
  const updateKeyPair = async () => {
    //generate public/private key
    const { publicKey, secretKey } = generateKeyPair();
    //save private key to Async storage
    await AsyncStorage.setItem(PRIVATE_KEY, secretKey.toString());
    //save public key to userModel in datastore
    const userData = await Auth.currentAuthenticatedUser();
    const dbUser = await DataStore.query(User, userData.attributes.sub);

    if (!dbUser) {
      Alert.alert("User not found");
      return;
    }

    await DataStore.save(
      User.copyOf(dbUser, (updated) => {
        updated.publicKey = publicKey.toString();
      })
    );
    Alert.alert("Successfully updated.");
  };
  return (
    <View>
      <Text>Settings</Text>
      <Pressable
        onPress={updateKeyPair}
        style={{
          backgroundColor: "white",
          height: 50,
          margin: 10,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 50,
        }}
      >
        <Text>Update keypair</Text>
      </Pressable>
      <Pressable
        onPress={logOut}
        style={{
          backgroundColor: "white",
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
};

export default Settings;
