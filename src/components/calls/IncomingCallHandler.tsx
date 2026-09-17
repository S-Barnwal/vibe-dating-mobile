import { useEffect, useState } from "react";
import { Alert } from "react-native";

import {
  acceptCall,
  rejectCall,
} from "../../services/call.service";

import {
  subscribeToSocketEvent,
} from "../../services/socket.service";

import IncomingCallModal, {
  IncomingCall,
} from "./IncomingCallModal";

export default function IncomingCallHandler() {
  const [incomingCall, setIncomingCall] =
    useState<IncomingCall | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupSocketListener = async () => {
      try {
        unsubscribe = await subscribeToSocketEvent(
          "incoming_call",
          ({
            call,
          }: {
            call: IncomingCall;
          }) => {
            console.log(
              "Incoming voice call:",
              call
            );

            setIncomingCall(call);
          }
        );
      } catch (error) {
        console.error(
          "Socket listener setup error:",
          error
        );
      }
    };

    setupSocketListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Accept call
  |--------------------------------------------------------------------------
  */

  const handleAccept = async () => {
    if (!incomingCall) {
      return;
    }

    try {
      const call = await acceptCall(
        incomingCall._id
      );

      console.log(
        "Voice call accepted:",
        call
      );

      setIncomingCall(null);

      /*
       * Agora voice screen will be opened
       * in the next step.
       */

      Alert.alert(
        "Call accepted",
        "Voice call audio will connect here."
      );
    } catch (error) {
      console.error(
        "Accept call error:",
        error
      );

      Alert.alert(
        "Unable to accept call",
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Reject call
  |--------------------------------------------------------------------------
  */

  const handleReject = async () => {
    if (!incomingCall) {
      return;
    }

    try {
      await rejectCall(
        incomingCall._id
      );

      setIncomingCall(null);
    } catch (error) {
      console.error(
        "Reject call error:",
        error
      );

      Alert.alert(
        "Unable to decline call",
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  };

  return (
    <IncomingCallModal
      call={incomingCall}
      onAccept={handleAccept}
      onReject={handleReject}
    />
  );
}