import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { DataStore, Auth, Storage } from "aws-amplify";
import { S3Image } from "aws-amplify-react-native";
import { User } from "../../src/models";
import AudioPlayer from "../AudioPlayer";
import { Ionicons } from "@expo/vector-icons";
import { Message as MessageModel } from "../../src/models";

const Message = (props) => {
  const [message, setMessage] = useState<MessageModel>(props.message);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isMe, setIsMe] = useState<Boolean | null>(null);
  const [soundURI, setSoundURI] = useState<string | null>(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const subscription = DataStore.observe(MessageModel, message.id).subscribe(
      (msg) => {
        if (msg.model === MessageModel && msg.opType === "UPDATE") {
          setMessage((message) => ({ ...message, ...msg.element }));
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setAsRead();
  }, [isMe]);

  useEffect(() => {
    DataStore.query(User, message.userID).then(setUser);
  }, []);

  useEffect(() => {
    if (message.audio) {
      Storage.get(message.audio).then(setSoundURI);
    }
  }, [message]);

  useEffect(() => {
    const checkIfMe = async () => {
      if (!user) {
        return;
      }
      const authUser = await Auth.currentAuthenticatedUser();
      setIsMe(user.id === authUser.attributes.sub);
    };
    checkIfMe();
  }, [user]);

  const setAsRead = () => {
    if (isMe == false && message.status !== "READ") {
      DataStore.save(
        MessageModel.copyOf(message, (updated) => (updated.status = "READ"))
      );
    }
  };

  if (!user) {
    return <ActivityIndicator />;
  }
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isMe ? "lightgrey" : "#3777f0",
          marginLeft: isMe ? "auto" : 10,
          marginRight: isMe ? 10 : "auto",
          width: soundURI ? "75%" : "auto",
        },
      ]}
    >
      {message.image && (
        <View style={{ marginBottom: message.content ? 10 : 0 }}>
          <S3Image
            imgKey={message.image}
            style={{ width: width * 0.65, aspectRatio: 4 / 3 }}
            resizeMode="contain"
          />
        </View>
      )}
      {soundURI && <AudioPlayer soundURI={soundURI} />}
      {!!message.content && (
        <Text style={{ color: isMe ? "black" : "white" }}>
          {message.content}
        </Text>
      )}
      {isMe && message.status !== "SENT" && !!message.status && (
        <Ionicons
          name={message.status === "DELIVERED" ? "checkmark" : "checkmark-done"}
          size={16}
          color="gray"
          style={{ marginHorizontal: 5 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3777f0",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    maxWidth: "75%",
    flexDirection: "row",
    alignItems: "flex-end",
  },
});

export default Message;
