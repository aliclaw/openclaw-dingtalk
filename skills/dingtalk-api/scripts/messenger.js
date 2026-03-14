#!/usr/bin/env node

/**
 * Send Message to DingTalk Group
 * Allows proactive sending of messages to DingTalk groups/chats
 */

const ExtendedDingTalkClient = require('../skills/dingtalk-api/scripts/extended-dingtalk-client');

class DingTalkMessenger {
  constructor() {
    this.appKey = process.env.DINGTALK_APP_KEY;
    this.appSecret = process.env.DINGTALK_APP_SECRET;
    
    if (!this.appKey || !this.appSecret) {
      throw new Error("Missing DINGTALK_APP_KEY or DINGTALK_APP_SECRET environment variables");
    }
    
    this.client = new ExtendedDingTalkClient(this.appKey, this.appSecret);
  }

  /**
   * Get chat/conversation ID by name or other identifiers
   */
  async getChatInfo(chatName) {
    // Note: This would require additional API calls to find chat IDs
    // The exact implementation depends on the available APIs and permissions
    console.log(`Looking for chat: ${chatName}`);
    // Implementation would go here
  }

  /**
   * Send text message to a specific conversation
   */
  async sendTextToGroup(groupId, message) {
    try {
      // Using the core client's sendTextMessage method
      const result = await this.client.sendTextMessageToUsers(groupId, message);
      return result;
    } catch (error) {
      console.error('Error sending message to group:', error.message);
      throw error;
    }
  }

  /**
   * Send text message to a chat/conversation by ID
   */
  async sendTextToChat(conversationId, message) {
    try {
      const result = await this.client.sendTextMessage(conversationId, message);
      return result;
    } catch (error) {
      console.error('Error sending message to chat:', error.message);
      throw error;
    }
  }

  /**
   * Get list of chat groups (if permissions allow)
   */
  async getChatList() {
    // This would use appropriate API to list available chats
    // Implementation depends on available APIs
    console.log("Getting chat list - implementation pending based on available APIs");
  }
}

module.exports = DingTalkMessenger;