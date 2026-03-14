#!/usr/bin/env node

/**
 * DingTalk API Client
 * Provides functionality to interact with DingTalk's APIs
 */

const axios = require('axios');
const crypto = require('crypto');

class DingTalkClient {
  constructor(appKey, appSecret) {
    this.appKey = appKey;
    this.appSecret = appSecret;
    this.accessToken = null;
    this.tokenExpireTime = null;
  }

  /**
   * Get access token from DingTalk
   */
  async getAccessToken() {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpireTime && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const url = `https://oapi.dingtalk.com/gettoken?appkey=${this.appKey}&appsecret=${this.appSecret}`;
      const response = await axios.get(url);
      
      if (response.data.errcode === 0) {
        this.accessToken = response.data.access_token;
        // Set expiration time (typically tokens expire in 7200 seconds)
        this.tokenExpireTime = Date.now() + (response.data.expires_in - 300) * 1000; // Subtract 5 mins for safety
        return this.accessToken;
      } else {
        throw new Error(`Failed to get access token: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('Error getting access token:', error.message);
      throw error;
    }
  }

  /**
   * Send text message to a conversation/chat
   */
  async sendTextMessage(conversationId, text) {
    try {
      const accessToken = await this.getAccessToken();
      const url = `https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2?access_token=${accessToken}`;

      const messageData = {
        agent_id: this.appKey, // Usually the app key serves as agent id
        userid_list: "", // Comma separated user IDs
        dept_id_list: "", // Comma separated department IDs
        to_all_user: false, // Set to true to send to all users
        msg: {
          msgtype: "text",
          text: {
            content: text
          }
        },
        conversation_id: conversationId
      };

      const response = await axios.post(url, messageData);
      
      if (response.data.errcode === 0) {
        console.log('Message sent successfully');
        return response.data;
      } else {
        throw new Error(`Failed to send message: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('Error sending message:', error.message);
      throw error;
    }
  }

  /**
   * Send text message to specific users
   */
  async sendTextMessageToUsers(userIds, text) {
    try {
      const accessToken = await this.getAccessToken();
      const url = `https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2?access_token=${accessToken}`;

      const messageData = {
        agent_id: 4235224997, // Use the Agent ID provided: 4235224997
        userid_list: Array.isArray(userIds) ? userIds.join(',') : userIds,
        to_all_user: false,
        msg: {
          msgtype: "text",
          text: {
            content: text
          }
        }
      };

      const response = await axios.post(url, messageData);
      
      if (response.data.errcode === 0) {
        console.log('Message sent to users successfully');
        return response.data;
      } else {
        throw new Error(`Failed to send message to users: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('Error sending message to users:', error.message);
      throw error;
    }
  }

  /**
   * Send message to a specific chat/conversation
   */
  async sendToConversation(conversationId, text) {
    try {
      const accessToken = await this.getAccessToken();
      const url = `https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2?access_token=${accessToken}`;

      const messageData = {
        agent_id: parseInt(this.appKey.replace(/\D/g, '')) || 4235224997, // Use the Agent ID provided
        chat_id: conversationId, // Use chat_id for group messaging
        msg: {
          msgtype: "text",
          text: {
            content: text
          }
        },
        to_all_user: false
      };

      const response = await axios.post(url, messageData);
      
      if (response.data.errcode === 0) {
        console.log('Message sent to conversation successfully');
        return response.data;
      } else {
        throw new Error(`Failed to send message to conversation: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('Error sending message to conversation:', error.message);
      throw error;
    }
  }

  /**
   * Get list of chat conversations
   */
  async getConversations() {
    try {
      const accessToken = await this.getAccessToken();
      // Using the correct API endpoint for getting chat list
      const url = `https://oapi.dingtalk.com/chat/list?access_token=${accessToken}`;
      
      // Parameters for the API call
      const params = {
        offset: 0,
        size: 100
      };

      const response = await axios.get(url, { params });
      
      if (response.data.errcode === 0) {
        return response.data.chat_info_list;
      } else {
        throw new Error(`Failed to get conversations: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('Error getting conversations:', error.message);
      // Fallback: Some APIs require different approach
      throw error;
    }
  }

  /**
   * Get user information by user ID
   */
  async getUserInfo(userId) {
    try {
      const accessToken = await this.getAccessToken();
      const url = `https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${accessToken}&userid=${userId}`;

      const response = await axios.get(url);
      
      if (response.data.errcode === 0) {
        return response.data.result;
      } else {
        throw new Error(`Failed to get user info: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('Error getting user info:', error.message);
      throw error;
    }
  }

  /**
   * Get department list
   */
  async getDepartmentList(deptId = 1) {
    try {
      const accessToken = await this.getAccessToken();
      const url = `https://oapi.dingtalk.com/department/list?access_token=${accessToken}&id=${deptId}`;

      const response = await axios.get(url);
      
      if (response.data.errcode === 0) {
        return response.data.department;
      } else {
        throw new Error(`Failed to get department list: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('Error getting department list:', error.message);
      throw error;
    }
  }

  /**
   * Get user list in a department (READ ONLY)
   */
  async getUserListByDepartment(deptId, offset = 0, size = 100) {
    try {
      const accessToken = await this.getAccessToken();
      // Using the basic department user list API
      const url = `https://oapi.dingtalk.com/user/listbypage?access_token=${accessToken}&department_id=${deptId}&offset=${offset}&size=${size}`;

      const response = await axios.get(url);
      
      if (response.data.errcode === 0) {
        return { list: response.data.userlist || [] };  // Return in consistent format
      } else {
        throw new Error(`Failed to get user list: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('Error getting user list:', error.message);
      throw error;
    }
  }
}

module.exports = DingTalkClient;

// Example usage
if (require.main === module) {
  // This would be used with actual credentials
  // const client = new DingTalkClient(process.env.DINGTALK_APP_KEY, process.env.DINGTALK_APP_SECRET);
  
  console.log("DingTalk API Client initialized.");
  console.log("Set DINGTALK_APP_KEY and DINGTALK_APP_SECRET environment variables to use.");
}