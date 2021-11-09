import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { DataStore, Auth } from "aws-amplify";
import { S3Image } from "aws-amplify-react-native";
import { User } from "../../src/models";

const Message = ({ message }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isMe, setIsMe] = useState<Boolean>(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    DataStore.query(User, message.userID).then(setUser);
  }, []);
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
        },
      ]}
    >
      {message.image && (
        <View style={{ marginBottom: message.content ? 10 : 0 }}>
          <S3Image
            imgKey={message.image}
            style={{ width: width * 0.7, aspectRatio: 4 / 3 }}
            resizeMode="contain"
          />
        </View>
      )}
      {!!message.content && (
        <Text style={{ color: isMe ? "black" : "white" }}>
          {message.content}
        </Text>
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
  },
});

export default Message;
