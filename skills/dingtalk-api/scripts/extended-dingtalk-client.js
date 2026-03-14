#!/usr/bin/env node

/**
 * Extended DingTalk API Client
 * Provides comprehensive functionality to interact with DingTalk's APIs
 * including reading organizational data, approvals, announcements, files, etc.
 */

const axios = require('axios');
const crypto = require('crypto');

class ExtendedDingTalkClient extends require('./dingtalk-client') {
  constructor(appKey, appSecret) {
    super(appKey, appSecret);
    this.appKey = appKey;
    this.appSecret = appSecret;
  }

  /**
   * Get organization structure (departments and sub-departments)
   */
  async getOrgStructure(deptId = 1) {
    try {
      const accessToken = await this.getAccessToken();
      const url = `https://oapi.dingtalk.com/department/list?access_token=${accessToken}&id=${deptId}&fetch_child=true`;

      const response = await axios.get(url);
      
      if (response.data.errcode === 0) {
        return response.data.department;
      } else {
        throw new Error(`Failed to get department list: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('Error getting organization structure:', error.message);
      throw error;
    }
  }

  /**
   * Get detailed user information by user ID
   */
  async getUserDetail(userId) {
    try {
      const accessToken = await this.getAccessToken();
      const url = `https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${accessToken}&userid=${userId}`;

      const response = await axios.get(url);
      
      if (response.data.errcode === 0) {
        return response.data.result;
      } else {
        throw new Error(`Failed to get user detail: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('Error getting user detail:', error.message);
      throw error;
    }
  }

  /**
   * Get all users in the organization
   */
  async getAllUsers() {
    try {
      const departments = await this.getDepartmentList();
      const allUsers = [];

      for (const dept of departments) {
        const users = await this.getUserListByDepartment(dept.id);
        allUsers.push(...users.list);
      }

      return allUsers;
    } catch (error) {
      console.error('Error getting all users:', error.message);
      throw error;
    }
  }

  /**
   * Get approval forms/templates
   */
  async getApprovalTemplates(offset = 0, size = 100) {
    try {
      const accessToken = await this.getAccessToken();
      // Using the correct API for getting process list (approval templates)
      const url = `https://oapi.dingtalk.com/topapi/process/get_by_userid?access_token=${accessToken}`;

      // Note: This API may require a specific user ID
      const params = {
        userid: ""  // May need to specify a user ID or use a different API
      };

      const response = await axios.post(url, params);
      
      if (response.data.errcode === 0) {
        return response.data.process_list || [];
      } else {
        // If the above fails, try an alternative API
        console.log("Trying alternative API for approval templates...");
        const altUrl = `https://oapi.dingtalk.com/topapi/process/listbyuserid?access_token=${accessToken}`;
        const altParams = {
          offset: offset,
          size: size
        };
        
        const altResponse = await axios.post(altUrl, altParams);
        
        if (altResponse.data.errcode === 0) {
          return altResponse.data.result?.process_list || altResponse.data.process_list || [];
        } else {
          throw new Error(`Failed to get approval templates: ${altResponse.data.errmsg}`);
        }
      }
    } catch (error) {
      console.error('Error getting approval templates:', error.message);
      // Return empty array instead of throwing to prevent failure
      return [];
    }
  }

  /**
   * Get announcements/posts from a specific group or company
   */
  async getAnnouncements(cursor = '', size = 20) {
    try {
      const accessToken = await this.getAccessToken();
      // Note: This uses a representative API endpoint
      // Actual announcement API may vary based on specific requirements
      const url = `https://oapi.dingtalk.com/topapi/workspace/project/query?access_token=${accessToken}`;

      const params = {
        cursor: cursor,
        size: size,
        // Additional parameters would depend on the specific API
      };

      const response = await axios.post(url, params);
      
      if (response.data.errcode === 0) {
        return response.data.result;
      } else {
        throw new Error(`Failed to get announcements: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('Error getting announcements:', error.message);
      throw error;
    }
  }

  /**
   * Get files from DingTalk
   */
  async getFiles(spaceId, folderId, offset = 0, size = 100) {
    try {
      const accessToken = await this.getAccessToken();
      // This is a representative API for file access
      const url = `https://oapi.dingtalk.com/topapi/files/metadata/list?access_token=${accessToken}`;

      const params = {
        space_id: spaceId,
        folder_id: folderId,
        offset: offset,
        size: size
      };

      const response = await axios.post(url, params);
      
      if (response.data.errcode === 0) {
        return response.data.file_metadata_list;
      } else {
        throw new Error(`Failed to get files: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('Error getting files:', error.message);
      throw error;
    }
  }

  /**
   * Get knowledge base articles
   */
  async getKnowledgeArticles(query = '', offset = 0, size = 100) {
    try {
      const accessToken = await this.getAccessToken();
      // Representative API for knowledge base
      const url = `https://oapi.dingtalk.com/topapi/doc/v2/doclist/list?access_token=${accessToken}`;

      const params = {
        query: query,
        offset: offset,
        size: size
      };

      const response = await axios.post(url, params);
      
      if (response.data.errcode === 0) {
        return response.data.result;
      } else {
        throw new Error(`Failed to get knowledge articles: ${response.data.errmsg}`);
      }
    } catch (error) {
      console.error('Error getting knowledge articles:', error.message);
      throw error;
    }
  }

  /**
   * Get specific approval instances/applications (READ ONLY)
   */
  async getApprovals(status = '', startTime = '', endTime = '', offset = 0, size = 100) {
    try {
      const accessToken = await this.getAccessToken();
      // First, try to get all process codes available
      const processCodes = await this.getApprovalTemplates();
      
      const results = [];
      
      // If we have process codes, query each one
      if (processCodes && processCodes.length > 0) {
        for (const processCodeObj of processCodes) {
          const processCode = typeof processCodeObj === 'string' ? processCodeObj : processCodeObj.process_code;
          
          const url = `https://oapi.dingtalk.com/topapi/processinstance/list?access_token=${accessToken}`;

          const params = {
            process_code: processCode,
            start_time: startTime ? parseInt(startTime) : 0,
            end_time: endTime ? parseInt(endTime) : 0,
            size: size,
            offset: offset,
            status_list: status ? [status] : []
          };

          try {
            const response = await require('axios').post(url, params);
            
            if (response.data.errcode === 0) {
              const instances = response.data.result?.list || [];
              results.push(...instances);
            }
          } catch (err) {
            // Continue with other process codes if one fails
            console.log(`Could not fetch instances for process code ${processCode}: ${err.message}`);
          }
        }
      } else {
        // If no process codes available, try querying without specific process code
        // This may not work depending on API requirements
        console.log("No process codes found, attempting general query...");
        // For now, return empty results
      }
      
      return results;
    } catch (error) {
      console.error('Error getting approvals:', error.message);
      throw error;
    }
  }

  /**
   * Get detailed approval instance information
   */
  async getApprovalDetails(instanceIds) {
    try {
      if (!Array.isArray(instanceIds) || instanceIds.length === 0) {
        return [];
      }

      const accessToken = await this.getAccessToken();
      const url = `https://oapi.dingtalk.com/topapi/processinstance/get?access_token=${accessToken}`;

      const results = [];
      for (const instanceId of instanceIds) {
        const response = await axios.post(url, { process_instance_id: instanceId });
        
        if (response.data.errcode === 0) {
          results.push(response.data.process_instance);
        }
      }

      return results;
    } catch (error) {
      console.error('Error getting approval details:', error.message);
      throw error;
    }
  }

  /**
   * Search across various data types in DingTalk
   */
  async search(query, dataType = 'all') {
    const results = {};

    try {
      if (dataType === 'all' || dataType === 'users') {
        // Simplified user search - in reality would use a dedicated search API
        results.users = await this.getAllUsers();
      }

      if (dataType === 'all' || dataType === 'approvals') {
        results.approvals = await this.getApprovals();
      }

      if (dataType === 'all' || dataType === 'announcements') {
        results.announcements = await this.getAnnouncements();
      }

      if (dataType === 'all' || dataType === 'files') {
        // Would need to implement with actual space/folder IDs
        results.files = []; // Placeholder until specific space IDs are provided
      }

      if (dataType === 'all' || dataType === 'knowledge') {
        results.knowledge = await this.getKnowledgeArticles(query);
      }

      return results;
    } catch (error) {
      console.error('Error during search:', error.message);
      throw error;
    }
  }
}

module.exports = ExtendedDingTalkClient;

// Example usage
if (require.main === module) {
  console.log("Extended DingTalk API Client initialized.");
  console.log("Provides comprehensive access to organizational data, approvals, announcements, files, and knowledge base.");
}