// store/communityStore.ts
import { create } from 'zustand';

interface Message {
  _id: string;
  sender: { _id: string; name: string; profilePhoto?: { url: string } };
  text?: string;
  image?: { url: string };
  type: 'text' | 'image' | 'system';
  replyTo?: { _id: string; text: string; sender: { name: string } };
  reactions: { emoji: string; user: string }[];
  createdAt: string;
  deleted?: boolean;
}

interface CommunityState {
  messages: Message[];
  typingUser: string | null;
  onlineCount: number;
  setMessages: (msgs: Message[]) => void;
  appendMessage: (msg: Message) => void;
  updateMessage: (id: string, patch: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  setTypingUser: (name: string | null) => void;
  setOnlineCount: (n: number) => void;
}

const useCommunityStore = create<CommunityState>((set) => ({
  messages: [],
  typingUser: null,
  onlineCount: 0,
  setMessages: (msgs) => set({ messages: msgs }),
  appendMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),
  updateMessage: (id, patch) =>
    set((s) => ({
      messages: s.messages.map((m) => (m._id === id ? { ...m, ...patch } : m)),
    })),
  deleteMessage: (id) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m._id === id ? { ...m, deleted: true, text: '' } : m
      ),
    })),
  setTypingUser: (name) => set({ typingUser: name }),
  setOnlineCount: (n) => set({ onlineCount: n }),
}));

export default useCommunityStore;