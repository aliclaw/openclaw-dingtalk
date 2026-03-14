---
name: dingtalk-api
description: DingTalk API client utilities and notes. Use for general DingTalk API integration when no specialized skill fits.
---

# dingtalk-api Skill

## Description
A read-only skill to interact with DingTalk's organization APIs, allowing OpenClaw to send messages to DingTalk groups and retrieve organizational data without modifying any organizational or application settings.

## Capabilities
- Send messages to DingTalk groups and users
- Retrieve organizational structure (departments, hierarchy) - READ ONLY
- Access detailed user information and personnel data - READ ONLY
- Retrieve approval workflows and approval instances - READ ONLY
- Access announcements and company posts - READ ONLY
- Retrieve files stored in DingTalk - READ ONLY
- Access knowledge base articles and documents - READ ONLY
- Search across different data types in DingTalk - READ ONLY
- Receive and process callbacks from DingTalk
- All operations are read-only to protect organizational integrity

## Configuration
This skill requires the following configuration:
- App Key and App Secret for the DingTalk application
- Corp ID for the organization
- Access token management
- Read-only permissions for accessing organizational data, files, approvals, etc.
- Callback URL if receiving events from DingTalk

## Prerequisites
- A registered DingTalk custom application with read-only permissions for:
  - Reading organizational data (no modification rights)
  - Accessing user information (no modification rights)
  - Reading approval workflows (no modification rights)
  - Accessing files and knowledge base (no modification rights)
  - Sending messages capability
- Network access to DingTalk API endpoints
- Proper OAuth2 authentication setup

## Usage
This skill enables OpenClaw to actively participate in DingTalk conversations beyond just responding to incoming messages. It allows for proactive communication and read-only data retrieval from the DingTalk organization, including organizational charts, personnel information, approval data, announcements, files, and knowledge base content. All operations are restricted to read-only access to preserve organizational integrity.