"use client";

import { type ToolInvocation } from "ai";
import Dexie, { Table } from "dexie";

export type TextUIPart = {
  type: "text";
  text: string;
};

export type ToolInvocationUIPart = {
  type: "tool-invocation";
  toolInvocation: ToolInvocation;
};

export type Message = {
  id: string;
  chatId: string;
  content: string;
  createdAt: Date;
  role: "user" | "assistant" | "system" | "data";
  parts: Array<TextUIPart | ToolInvocationUIPart>;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

interface PaginationResult<T> {
  data: T[];
  hasMore: boolean;
  total: number;
}

class Database extends Dexie {
  chats!: Table<Chat, string>;

  constructor() {
    super("Database");

    this.version(1).stores({
      chats: "id, messages, createdAt, updatedAt",
    });
  }

  // Get paginated messages for a chat
  async getMessagesByChatId(
    chatId: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<PaginationResult<Message>> {
    const chat = await this.chats.get(chatId);

    if (!chat || !Array.isArray(chat.messages)) {
      return {
        data: [],
        hasMore: false,
        total: 0,
      };
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    // Get total count
    const total = chat.messages.length;

    // Get slice of messages for current page
    const messages = chat.messages
      .slice(start, end)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return {
      data: messages,
      hasMore: end < total,
      total,
    };
  }

  // Get paginated chats
  async getAllChats(
    page: number = 1,
    pageSize: number = 20,
  ): Promise<PaginationResult<Chat>> {
    const total = await this.chats.count();

    const chats = await this.chats
      .orderBy("updatedAt")
      .reverse()
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return {
      data: chats,
      hasMore: page * pageSize < total,
      total,
    };
  }

  // Create a new chat
  async createChat(chatId: string): Promise<Chat> {
    const newChat: Chat = {
      title: "New Chat",
      id: chatId,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };
    await this.chats.add(newChat);
    return newChat;
  }

  // Add a message to an existing chat
  async addMessageToChat(
    chatId: string,
    message: TextUIPart | ToolInvocationUIPart,
    role: "user" | "assistant" | "system" | "data" = "user",
  ): Promise<void> {
    const chat = await this.chats.get(chatId);
    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }

    const newMessage: Message = {
      id: `${chatId}-${Date.now()}`,
      chatId,
      content: "",
      createdAt: new Date(),
      role,
      parts: [message],
    };

    if (!Array.isArray(chat.messages)) {
      chat.messages = [];
    }

    chat.messages.push(newMessage);
    chat.updatedAt = new Date();

    await this.chats.put(chat);
  }

  // Delete a chat
  async deleteChat(chatId: string): Promise<void> {
    await this.chats.delete(chatId);
  }

  // Get a single chat by ID with optional message pagination
  async getChatById(
    id: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<Chat | undefined> {
    const chat = await this.chats.get(id);

    if (chat && Array.isArray(chat.messages)) {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      chat.messages = chat.messages.slice(start, end);
    }

    return chat;
  }

  // Update chat title
  async updateChatTitle(id: string, title: string): Promise<void> {
    await this.chats.update(id, { title });
  }

  // Search chats with pagination
  async searchChats(
    query: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<PaginationResult<Chat>> {
    const queryLower = query.toLowerCase();

    // Get all chats that match the search query
    const matchingChats = await this.chats
      .filter(
        (chat) =>
          chat.title.toLowerCase().includes(queryLower) ||
          chat.messages.some((msg) =>
            msg.content.toLowerCase().includes(queryLower),
          ),
      )
      .toArray();

    const total = matchingChats.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: matchingChats.slice(start, end),
      hasMore: end < total,
      total,
    };
  }
}

// Export a single instance of the Database
export const dxdb = new Database();

if (typeof window !== "undefined") {
  // @ts-expect-error ignore next line
  window.dxdb = dxdb;
}
