#!/usr/bin/env node

/**
 * Example: Using Extended DingTalk API to Access Organizational Data
 * Demonstrates accessing various types of data in DingTalk
 */

const ExtendedDingTalkClient = require('./extended-dingtalk-client');

async function demonstrateAccess() {
  // Load credentials
  const appKey = process.env.DINGTALK_APP_KEY;
  const appSecret = process.env.DINGTALK_APP_SECRET;
  
  if (!appKey || !appSecret) {
    console.error("Missing DINGTALK_APP_KEY or DINGTALK_APP_SECRET environment variables");
    return;
  }

  const client = new ExtendedDingTalkClient(appKey, appSecret);

  console.log("=== Demonstrating Extended DingTalk API Capabilities ===\n");

  try {
    // 1. Get organization structure
    console.log("1. Getting organization structure...");
    const orgStructure = await client.getOrgStructure();
    console.log(`   Retrieved ${orgStructure.length} departments\n`);

    // 2. Get all users
    console.log("2. Getting all users in organization...");
    const allUsers = await client.getAllUsers();
    console.log(`   Retrieved ${allUsers.length} users\n`);

    // 3. Get approval templates
    console.log("3. Getting approval templates...");
    try {
      const approvalTemplates = await client.getApprovalTemplates();
      console.log(`   Retrieved ${approvalTemplates.length} approval templates\n`);
    } catch (error) {
      console.log(`   Could not retrieve approval templates: ${error.message}\n`);
    }

    // 4. Get announcements
    console.log("4. Getting announcements...");
    try {
      const announcements = await client.getAnnouncements();
      console.log(`   Retrieved announcements\n`);
    } catch (error) {
      console.log(`   Could not retrieve announcements: ${error.message}\n`);
    }

    // 5. Get knowledge base articles
    console.log("5. Getting knowledge base articles...");
    try {
      const knowledgeArticles = await client.getKnowledgeArticles('', 0, 10);
      console.log(`   Retrieved knowledge articles\n`);
    } catch (error) {
      console.log(`   Could not retrieve knowledge articles: ${error.message}\n`);
    }

    // 6. Get recent approvals
    console.log("6. Getting recent approvals...");
    try {
      const approvals = await client.getApprovals('', '', '', 0, 10);
      console.log(`   Retrieved ${approvals.length} approval instances\n`);
    } catch (error) {
      console.log(`   Could not retrieve approvals: ${error.message}\n`);
    }

    // 7. Perform a general search
    console.log("7. Performing general search...");
    try {
      const searchResults = await client.search('test');
      console.log(`   Search completed\n`);
    } catch (error) {
      console.log(`   Could not perform search: ${error.message}\n`);
    }

    console.log("=== All organizational data access methods demonstrated ===");
  } catch (error) {
    console.error("Error during demonstration:", error.message);
  }
}

// Execute if run directly
if (require.main === module) {
  demonstrateAccess().catch(console.error);
}

module.exports = { demonstrateAccess };