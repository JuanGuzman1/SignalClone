import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  AntDesign,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { DataStore, Auth } from "aws-amplify";
import { Message } from "../../src/models";
import { ChatRoom } from "../../src/models";
import EmojiSelector from "react-native-emoji-selector";

const MessageInput = ({ chatRoom }) => {
  const [message, setMessage] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const sendMessage = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const newMessage = await DataStore.save(
        new Message({
          content: message,
          userID: user.attributes.sub,
          chatroomID: chatRoom.id,
        })
      );
      updateLastMessage(newMessage);
      setMessage("");
      setIsEmojiPickerOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  const updateLastMessage = async (newMessage) => {
    DataStore.save(
      ChatRoom.copyOf(chatRoom, (updatedChatRoom) => {
        updatedChatRoom.LastMessage = newMessage;
      })
    );
  };

  const onPlusClicked = () => {
    console.warn("on plus clicked");
  };

  const onPress = () => {
    if (message) {
      sendMessage();
    } else {
      onPlusClicked();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { height: isEmojiPickerOpen ? "50%" : "auto" }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={styles.row}>
        <View style={styles.inputContainer}>
          <Pressable onPress={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}>
            <SimpleLineIcons
              name="emotsmile"
              size={24}
              color="#595959"
              style={styles.icon}
            />
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder="Signal Message ..."
            onChangeText={setMessage}
            value={message}
          />
          <Feather
            name="camera"
            size={24}
            color="#595959"
            style={styles.icon}
          />
          <MaterialCommunityIcons
            name="microphone-outline"
            size={24}
            color="#595959"
            style={styles.icon}
          />
        </View>
        <Pressable onPress={onPress} style={styles.buttonContainer}>
          {message ? (
            <Ionicons name="send" size={18} color="white" />
          ) : (
            <AntDesign name="plus" size={24} color="white" />
          )}
        </Pressable>
      </View>
      {isEmojiPickerOpen && (
        <EmojiSelector
          onEmojiSelected={(emoji) =>
            setMessage((currentMessage) => currentMessage + emoji)
          }
          columns={8}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    padding: 10,
  },
  row: {
    flexDirection: "row",
  },
  inputContainer: {
    backgroundColor: "#f2f2f2",
    flex: 1,
    flexDirection: "row",
    marginRight: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#dedede",
    alignItems: "center",
    padding: 5,
  },
  buttonContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#3777f0",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    marginHorizontal: 5,
  },
  icon: {
    marginHorizontal: 5,
  },
});

export default MessageInput;
