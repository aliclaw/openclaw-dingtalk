#!/usr/bin/env node

/**
 * Retrieve DingTalk Organization Structure and Personnel
 * This script demonstrates how to get the organizational hierarchy and personnel list
 */

const ExtendedDingTalkClient = require('./extended-dingtalk-client');

// Load environment variables from .env file
const fs = require('fs');
if (fs.existsSync('../../../.env')) {
  const envData = fs.readFileSync('../../../.env', 'utf8');
  envData.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.join('=').trim();
      }
    }
  });
}

async function getOrgStructureAndPersonnel() {
  // Load credentials from environment variables
  const appKey = process.env.DINGTALK_APP_KEY;
  const appSecret = process.env.DINGTALK_APP_SECRET;
  
  if (!appKey || !appSecret) {
    console.log("❌ 无法获取钉钉应用凭证");
    console.log("💡 请设置环境变量 DINGTALK_APP_KEY 和 DINGTALK_APP_SECRET");
    console.log("📋 使用方法:");
    console.log("   export DINGTALK_APP_KEY='your_app_key'");
    console.log("   export DINGTALK_APP_SECRET='your_app_secret'");
    return;
  }

  const client = new ExtendedDingTalkClient(appKey, appSecret);

  console.log("🔍 正在获取钉钉组织架构和人员信息...\n");

  try {
    // 1. Get top-level organization structure
    console.log("🏢 获取组织架构...");
    const departments = await client.getOrgStructure(1); // Start with root department
    
    console.log(`✅ 获取到 ${departments.length} 个部门\n`);
    
    // 2. Get users for each department
    console.log("👥 获取各部门人员信息...\n");
    
    for (const dept of departments) {
      console.log(`🏢 部门: ${dept.name} (ID: ${dept.id})`);
      
      try {
        // Get users in this department
        const userListResult = await client.getUserListByDepartment(dept.id);
        const users = userListResult.list || [];
        
        if (users.length > 0) {
          console.log(`   👤 部门成员 (${users.length} 人):`);
          users.forEach(user => {
            console.log(`     - ${user.name} (工号: ${user.userid || 'N/A'})`);
          });
        } else {
          console.log(`   👤 该部门暂无成员`);
        }
        
        // Add some delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`   ❌ 获取部门成员失败: ${error.message}`);
      }
      
      console.log(""); // Empty line for readability
    }

    console.log("📈 完整组织架构获取完成!");
    
  } catch (error) {
    console.error("❌ 获取组织架构时发生错误:", error.message);
  }
}

// Execute if run directly
if (require.main === module) {
  getOrgStructureAndPersonnel().catch(console.error);
}

module.exports = { getOrgStructureAndPersonnel };