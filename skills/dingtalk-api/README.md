# Scripts for Read-Only DingTalk API Integration

## Overview
This directory contains scripts to interact with DingTalk APIs for:
- Obtaining access tokens
- Sending messages to groups/users
- Retrieving organizational data (structure, personnel) - READ ONLY
- Accessing approval workflows and instances - READ ONLY
- Retrieving announcements and posts - READ ONLY
- Accessing files and knowledge base content - READ ONLY
- Searching across different data types - READ ONLY

## Scripts

### 1. Authentication
- `dingtalk-client.js`: Core client with access token management

### 2. Messaging
- `send-birthday-greetings.js`: Send birthday messages to DingTalk users/groups

### 3. Extended Data Retrieval
- `extended-dingtalk-client.js`: Enhanced client with read-only data access
  - Organization structure and user details (read-only)
  - Approval workflows and instances (read-only)
  - Announcements and posts (read-only)
  - Files and knowledge base content (read-only)
  - Search functionality across data types (read-only)

## Capabilities
- **Organizational Data**: Get department structure, user information (read-only)
- **Personnel Information**: Detailed user profiles, contact information (read-only)
- **Approval Data**: Access to approval forms, instances, and processes (read-only)
- **Announcements**: Company/group announcements and posts (read-only)
- **File Access**: Retrieve files stored in DingTalk (read-only)
- **Knowledge Base**: Access to knowledge articles and documents (read-only)
- **Search**: Cross-data-type search functionality (read-only)
- **Messaging**: Send messages to users/groups (no modification of org data)

## Security Notice
All operations are designed to be read-only to protect organizational data integrity. No modifications to organization or application settings are permitted.

## Dependencies
- axios for HTTP requests
- crypto for signature generation