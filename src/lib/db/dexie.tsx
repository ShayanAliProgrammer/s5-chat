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

class Database extends Dexie {
  chats!: Table<Chat, string>;

  constructor() {
    super("Database");

    this.version(1).stores({
      chats: "id, messages, createdAt, updatedAt",
    });
  }

  // Create a new chat.
  async createChat(chatId: string): Promise<Chat> {
    const newChat: Chat = {
      title: "New Chat",
      id: chatId,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [], // initially empty; messages will be stored in the messages table.
    };
    await this.chats.add(newChat);
    return newChat;
  }

  // Add a message to an existing chat.
  async addMessageToChat(
    chatId: string,
    message: TextUIPart | ToolInvocationUIPart,
    role: "user" | "assistant" | "system" | "data" = "user", // Allow specifying role
  ): Promise<void> {
    const chat = await this.chats.get(chatId);
    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }

    const newMessage: Message = {
      id: `${chatId}-${Date.now()}`, // A simple way to create a unique message id.
      chatId,
      content: "",
      createdAt: new Date(),
      role,
      parts: [message],
    };

    // Instead of creating a new array with spread, push the new message directly.
    if (Array.isArray(chat.messages)) {
      chat.messages.push(newMessage);
    } else {
      chat.messages = [newMessage];
    }
    // Update the chat's updatedAt timestamp.
    chat.updatedAt = new Date();
    await this.chats.put(chat);
  }

  async getMessagesByChatId(chatId: string): Promise<Message[]> {
    return (await this.chats.where("id").equals(chatId).toArray())[0]!.messages;
  }

  // Delete a chat and its associated messages.
  async deleteChat(chatId: string): Promise<void> {
    await this.chats.delete(chatId);
  }

  // Retrieve all chats.
  async getAllChats(): Promise<Chat[]> {
    return this.chats.orderBy("updatedAt").reverse().toArray();
  }

  // In Dexie DB methods (assumes you have a 'chats' store in Dexie)
  async getChatById(id: string) {
    const chat = await dxdb.chats.get(id);
    return chat;
  }

  async updateChatTitle(id: string, title: string) {
    await dxdb.chats.update(id, { title });
  }
}

// Export a single instance of the Database.
export const dxdb = new Database();
