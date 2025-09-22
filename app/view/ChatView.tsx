import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Image,
} from "react-native";
import { useChat } from "@/hooks/useChat";
import type { ChatRoom, Message } from "../../lib/types";
import { useChatRoom } from "@/hooks/useChatRoom";
import { useSession } from "@/lib/SessionContext";
import { supabase } from "@/lib/supabase";

interface ChatScreenProps {
  roomId: string;
  currentUserId: string;
  otherUserName?: string;
  role: "clinic" | "patient";
}

type Props = {
  role: "clinic" | "patient";
};

const ChatView: React.FC<Props> = (props) => {
  const { session } = useSession();

  const { width } = useWindowDimensions();
  const [tabScreen, setTabScreen] = useState<"rooms" | "chat">("rooms");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [otherUserName, setOtherUserName] = useState<string>("");
  const [avatars, setAvatars] = useState<Record<string, string>>({});

  const { createOrFindRoom } = useChatRoom();

  const handleRoomSelect = (roomId: string, otherUserName: string) => {
    setSelectedRoomId(roomId);
    setOtherUserName(otherUserName);
    setTabScreen("chat");
  };

  const fetchAvatar = async (userId: string) => {
    if (!userId || avatars[userId]) return; // avoid re-fetching

    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (!error && data?.avatar_url) {
      setAvatars((prev) => ({ ...prev, [userId]: data.avatar_url }));
    }
  };

  const handleCreateRoom = async (targetUserId: string) => {
    if (!session?.user?.id) return;

    try {
      const roomId = await createOrFindRoom(session.user.id, targetUserId);
      // For created rooms, you may want to fetch the other user's name here
      handleRoomSelect(roomId, "User");
    } catch (error) {
      Alert.alert("Error", "Failed to create chat room");
    }
  };

  const handleBackToRooms = () => {
    setTabScreen("rooms");
    setSelectedRoomId("");
    setOtherUserName("");
  };

  if (!session?.user?.id) {
    return (
      <View style={styles.centerContainer}>
        <Text>You need to be logged in to chat.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {tabScreen === "rooms" ? (
          <ChatRoomsList
            role={props.role}
            currentUserId={session.user.id}
            onRoomSelect={handleRoomSelect}
            onCreateRoom={handleCreateRoom}
          />
        ) : (
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={{ padding: 10, backgroundColor: "#f0f0f0" }}
              onPress={handleBackToRooms}
            >
              <Text>← Back to Chats</Text>
            </TouchableOpacity>
            <ChatScreen
              role={props.role}
              roomId={selectedRoomId}
              currentUserId={session.user.id}
              otherUserName={otherUserName}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default ChatView;

export const ChatScreen: React.FC<ChatScreenProps> = ({
  role,
  roomId,
  currentUserId,
  otherUserName = "User",
}) => {
  const [inputText, setInputText] = useState("");
  const { messages, loading, error, sendMessage } = useChat(roomId, currentUserId);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    try {
      await sendMessage(inputText.trim());
      setInputText("");
    } catch (err) {
      Alert.alert("Error", "Failed to send message");
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === currentUserId;

    return (
      <View>
        <Text
          style={{
            alignSelf: isMyMessage ? "flex-end" : "flex-start",
            marginHorizontal: 10,
            fontWeight: "600",
            color: "#555",
          }}
        >
          {isMyMessage ? "You" : otherUserName}
        </Text>
        <View
          style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={{
              ...styles.timestamp,
              color: isMyMessage ? "#e3f1ffff" : "#555",
            }}
          >
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading chat...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat with {otherUserName}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={{ flex: 1, padding: 16 }}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          alignItems: "flex-end",
        }}
      >
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          multiline
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

interface ChatRoomsListProps {
  role: "clinic" | "patient";
  currentUserId: string;
  onRoomSelect: (roomId: string, otherUserName: string) => void;
  onCreateRoom: (otherUserId: string) => void;
}

export const ChatRoomsList: React.FC<ChatRoomsListProps> = ({
  role,
  currentUserId,
  onRoomSelect,
  onCreateRoom,
}) => {
  const { rooms, loading, getUserRooms } = useChatRoom();
  const { width } = useWindowDimensions();
  const isMobile = width < 480;

  useEffect(() => {
    if (currentUserId) {
      getUserRooms(currentUserId);
    }
  }, [currentUserId]);

  const renderRoom = ({ item }: { item: ChatRoom }) => {
    const otherUserName =
      role === "clinic"
        ? `${item.profiles.first_name} ${item.profiles.last_name}`
        : item?.clinic_profiles?.clinic_name || "Unknown Clinic";

    const otherUserAvatarUrl =
      role === "clinic"
        ? item?.profiles?.avatar_url
        : item?.clinic_profiles?.clinic_photo_url

    const hasUnread = item.messages?.some(
      (msg) => msg.receiver_id === currentUserId && !msg.is_read
    );

    return (
      <TouchableOpacity
        style={styles.roomItem}
        onPress={() => onRoomSelect(item.id, otherUserName)}
      >
        <View style={styles.roomHeader}>
          <Image
            source={
              otherUserAvatarUrl
                ? { uri: otherUserAvatarUrl }
                : require("../../assets/default.png") // add your default avatar path
            }
            style={styles.avatar}
          />
        <Text
          style={[
            styles.roomTitle,
            isMobile
              ? otherUserName.length > 25
                ? { fontSize: 14 }
                : { fontSize: 18 }
              : null,
          ]}
        >
          {isMobile && otherUserName.length > 25
            ? otherUserName.slice(0, 25) + "..."
            : otherUserName}
        </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {hasUnread && <View style={[styles.unreadDot, { marginRight: 6 }]} />}
          <Text style={styles.roomDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading rooms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={{...styles.title, textAlign: isMobile ? "center" : "left"}}>Your Chats</Text>
      <FlatList
        data={rooms}
        renderItem={renderRoom}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No chats yet</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#4a90e2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  messageContainer: {
    marginVertical: 6,
    maxWidth: "75%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e1e4ea",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#333",
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 6,
    textAlign: "right",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    marginRight: 12,
    backgroundColor: "#fff",
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: "#4a90e2",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4a90e2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: "#a5b1c2",
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
    fontWeight: "600",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    padding: 20,
    color: "#003f30ff",
  },
  list: {
    flex: 1,
  },
  roomItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  roomTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1f2937",
  },
  roomDate: {
    fontSize: 13,
    color: "#6b7280",
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 60,
    fontSize: 16,
    fontStyle: "italic",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  roomHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
});
