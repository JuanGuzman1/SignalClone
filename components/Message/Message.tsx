import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Pressable,
  Alert,
} from "react-native";
import { DataStore, Auth, Storage } from "aws-amplify";
import { S3Image } from "aws-amplify-react-native";
import { User } from "../../src/models";
import AudioPlayer from "../AudioPlayer";
import { Ionicons } from "@expo/vector-icons";
import { Message as MessageModel } from "../../src/models";
import MessageReply from "../MessageReply";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { box } from "tweetnacl";
import {
  decrypt,
  getMyPrivateKey,
  stringToUint8Array,
} from "../../utils/crypto";

const Message = (props) => {
  const { setAsMessageReply, message: propMessage } = props;
  const [message, setMessage] = useState<MessageModel>(propMessage);
  const [decryptedContent, setDecryptedContent] = useState("");
  const [replyTo, setReplyTo] = useState<MessageModel | undefined>(undefined);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isMe, setIsMe] = useState<Boolean | null>(null);
  const [soundURI, setSoundURI] = useState<string | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const { width } = useWindowDimensions();
  const { showActionSheetWithOptions } = useActionSheet();

  useEffect(() => {
    const subscription = DataStore.observe(MessageModel, message.id).subscribe(
      (msg) => {
        if (msg.model === MessageModel) {
          if (msg.opType === "UPDATE") {
            setMessage((message) => ({ ...message, ...msg.element }));
          } else if (msg.opType === "DELETE") {
            setIsDeleted(true);
          }
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
    setMessage(propMessage);
  }, [propMessage]);

  useEffect(() => {
    if (message?.replyToMessageID) {
      DataStore.query(MessageModel, message.replyToMessageID).then(setReplyTo);
    }
  }, [message]);

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

  useEffect(() => {
    if (!message.content || !user?.publicKey) {
      return;
    }
    const decryptMessage = async () => {
      //decrypt message.content
      const ourSecretKeyString = await getMyPrivateKey();
      const sharedKey = box.before(
        stringToUint8Array(user?.publicKey),
        stringToUint8Array(ourSecretKeyString)
      );
      const decrypted = decrypt(sharedKey, message.content);
      setDecryptedContent(decrypted.message);
    };
    decryptMessage();
  }, [message, user]);

  const setAsRead = () => {
    if (isMe == false && message.status !== "READ") {
      DataStore.save(
        MessageModel.copyOf(message, (updated) => (updated.status = "READ"))
      );
    }
  };

  const deleteMessage = async () => {
    await DataStore.delete(message);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Confirm delete",
      "Are you sure you want to delete this message?",
      [
        {
          text: "Delete",
          onPress: deleteMessage,
          style: "destructive",
        },
        {
          text: "Cancel",
        },
      ]
    );
  };

  const onActionPress = (index) => {
    if (index == 0) {
      setAsMessageReply();
    } else if (index == 1) {
      if (isMe) {
        confirmDelete();
      } else {
        Alert.alert("Can't perform action", "This is not your message");
      }
    }
  };

  const openActionMenu = () => {
    const options = ["Reply", "Delete", "Cancel"];

    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;
    showActionSheetWithOptions(
      { options, destructiveButtonIndex, cancelButtonIndex },
      onActionPress
    );
  };

  if (!user) {
    return <ActivityIndicator />;
  }
  return (
    <Pressable
      onLongPress={openActionMenu}
      style={[
        styles.container,
        {
          backgroundColor: isMe ? "lightgrey" : "#3777f0",
          marginLeft: isMe ? "auto" : 10,
          marginRight: isMe ? 10 : "auto",
          width: soundURI ? "75%" : "auto",
          alignItems: isMe ? "flex-end" : "flex-start",
        },
      ]}
    >
      {replyTo && <MessageReply message={replyTo} />}
      <View style={styles.row}>
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
        {!!decryptedContent && (
          <Text style={{ color: isMe ? "black" : "white" }}>
            {isDeleted ? "message deleted " : decryptedContent}
          </Text>
        )}
        {isMe && message.status !== "SENT" && !!message.status && (
          <Ionicons
            name={
              message.status === "DELIVERED" ? "checkmark" : "checkmark-done"
            }
            size={16}
            color="gray"
            style={{ marginHorizontal: 5 }}
          />
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#3777f0",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  messageReply: {
    backgroundColor: "gray",
    padding: 5,
    borderRadius: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
});

export default Message;
