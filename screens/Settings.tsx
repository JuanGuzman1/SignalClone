import React from "react";
import { View, Text, Pressable } from "react-native";
import { Auth, DataStore } from "aws-amplify";
import { generateKeyPair } from "../utils/crypto";

const Settings = () => {
  const logOut = async () => {
    await DataStore.clear();
    Auth.signOut();
  };
  const updateKeyPair = async () => {
    //generate public/private key
    const { publicKey, secretKey } = generateKeyPair();
    //save private key to Async storage
    //save public key to userModel in datastore
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
