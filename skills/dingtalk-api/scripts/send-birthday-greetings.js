#!/usr/bin/env node

/**
 * Send Birthday Greetings to DingTalk
 * Uses DingTalk API to send birthday greetings to specified group or users
 */

const DingTalkClient = require('./dingtalk-client');
const fs = require('fs');

async function sendBirthdayGreetings() {
  // Load DingTalk credentials from environment or config
  const appKey = process.env.DINGTALK_APP_KEY;
  const appSecret = process.env.DINGTALK_APP_SECRET;
  
  if (!appKey || !appSecret) {
    console.error("Missing DINGTALK_APP_KEY or DINGTALK_APP_SECRET environment variables");
    console.log("Please set these environment variables with your DingTalk custom app credentials");
    return;
  }

  // Create DingTalk client
  const client = new DingTalkClient(appKey, appSecret);

  // Get today's date to determine whose birthday it is
  const today = new Date();
  const month = today.getMonth() + 1; // Month is zero-indexed
  const day = today.getDate();

  // Read birthday data from our stored file
  let birthdayData = {};
  try {
    const birthdayFile = fs.readFileSync('/root/.openclaw/workspace/memory/birthdays.md', 'utf8');
    
    // Simple parsing to find today's birthday
    const lines = birthdayFile.split('\n');
    let currentMonth = '';
    
    for (const line of lines) {
      if (line.startsWith('### ')) {
        // Extract month from header like "### 二月"
        const monthMatch = line.match(/###\s*(.*)/);
        if (monthMatch) {
          currentMonth = monthMatch[1].trim();
        }
      } else if (line.startsWith('- ') && currentMonth) {
        // Parse birthday entry like "- 小测: 2月2日"
        const birthdayMatch = line.match(/-\s*([^:]+):\s*(\d+)月(\d+)日/);
        if (birthdayMatch) {
          const [, name, bMonth, bDay] = birthdayMatch;
          if (parseInt(bMonth) === month && parseInt(bDay) === day) {
            birthdayData[name] = { month: parseInt(bMonth), day: parseInt(bDay) };
          }
        }
      }
    }
  } catch (error) {
    console.error("Could not read birthday data:", error.message);
    return;
  }

  if (Object.keys(birthdayData).length === 0) {
    console.log(`No birthdays found for ${month}月${day}日`);
    return;
  }

  try {
    // Prepare birthday message
    const birthdayNames = Object.keys(birthdayData);
    const nameList = birthdayNames.join('、');
    const birthdayMessage = `🎉 今天是 ${nameList} 的生日！🎂\n\n祝生日快乐！🎊\n愿您在新的一岁里，身体健康，工作顺利，天天开心！🥳`;

    // In a real implementation, we would send to a specific conversation ID
    // For now, we'll log the message that would be sent
    console.log("Birthday message prepared:");
    console.log(birthdayMessage);
    console.log("\nNote: To send this message, you need to specify a conversation_id or user_ids");
    console.log("This requires configuring your DingTalk custom app with proper permissions");
    
    // Example of how to send the message (would need actual conversation/user IDs):
    /*
    // Option 1: Send to a specific conversation (group chat)
    await client.sendTextMessage(conversationId, birthdayMessage);
    
    // Option 2: Send to specific users
    await client.sendTextMessageToUsers([userId1, userId2], birthdayMessage);
    */
  } catch (error) {
    console.error("Error preparing or sending birthday message:", error.message);
  }
}

// Execute if run directly
if (require.main === module) {
  sendBirthdayGreetings().catch(console.error);
}

module.exports = { sendBirthdayGreetings };