import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-get-random-values";
import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";
import { withAuthenticator } from "aws-amplify-react-native";
import { Amplify, Hub, DataStore, Auth } from "aws-amplify";
import config from "./src/aws-exports";
import { Message, User } from "./src/models";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { PRNG, generateKeyPair, encrypt, decrypt } from "./utils/crypto";
import { setPRNG, box } from "tweetnacl";

Amplify.configure(config);

setPRNG(PRNG);

const obj = { hello: "world" };

const pairA = generateKeyPair();
const pairB = generateKeyPair();

const sharedA = box.before(pairB.publicKey, pairA.secretKey);
const encrypted = encrypt(sharedA, obj);

const sharedB = box.before(pairA.publicKey, pairB.secretKey);
const decrypted = decrypt(sharedB, encrypted);
console.log(obj, encrypted, decrypted);

function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Create listener
    const listener = Hub.listen("datastore", async (hubData) => {
      const { event, data } = hubData.payload;
      if (event === "networkStatus") {
        console.log(`User has a network connection: ${data.active}`);
      }
      if (
        event === "outboxMutationProcessed" &&
        data.model === Message &&
        !["DELIVERED", "READ"].includes(data.element.status)
      ) {
        //set the message status delivered
        DataStore.save(
          Message.copyOf(data.element, (updated) => {
            updated.status = "DELIVERED";
          })
        );
      }
    });

    // Remove listener
    return () => listener();
  }, []);
  useEffect(() => {
    if (!user) {
      return;
    }
    const subscription = DataStore.observe(User, user?.id).subscribe((msg) => {
      if (msg.model === User && msg.opType === "UPDATE") {
        setUser(msg.element);
      }
    });
    return () => subscription.unsubscribe();
  }, [user?.id]);
  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateLastOnline();
    }, 1 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUser = async () => {
    const userData = await Auth.currentAuthenticatedUser();
    const user = await DataStore.query(User, userData.attributes.sub);
    if (user) {
      setUser(user);
    }
  };

  const updateLastOnline = async () => {
    if (!user) {
      return;
    }
    const response = await DataStore.save(
      User.copyOf(user, (updated) => {
        updated.lastOnlineAt = +new Date();
      })
    );
    setUser(response);
  };

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <ActionSheetProvider>
          <Navigation colorScheme={colorScheme} />
        </ActionSheetProvider>
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}

export default withAuthenticator(App);
