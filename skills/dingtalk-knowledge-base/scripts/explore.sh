#!/bin/bash
# Explore Knowledge Base Structure
# 递归探索知识库完整结构
# Usage: bash scripts/explore.sh <workspaceId> <rootNodeId> [outputDir]

set -e

CONFIG_FILE="/root/.openclaw/workspace/GLOBAL_MEMORY.md"
TOKEN=$(grep "App Key:" "$CONFIG_FILE" | sed 's/.*App Key: *//' | tr -d '\r')
UNION_ID=$(grep "unionId:" "$CONFIG_FILE" | sed 's/.*unionId: *//' | tr -d '\r')

[ -z "$TOKEN" ] && { echo "❌ Token缺失"; exit 1; }
[ -z "$UNION_ID" ] && { echo "❌ unionId缺失"; exit 1; }

[ $# -lt 2 ] && { echo "用法: $0 <workspaceId> <rootNodeId> [outputDir]"; exit 1; }

WORKSPACE_ID="$1"
ROOT_NODE_ID="$2"
OUTPUT_DIR="${3:-output}"
INDENT="${4:-}"

mkdir -p "$OUTPUT_DIR"
OUTPUT_FILE="$OUTPUT_DIR/${WORKSPACE_ID}_structure.txt"
> "$OUTPUT_FILE"

echo "🔍 探索知识库: $WORKSPACE_ID"
echo "📁 输出: $OUTPUT_FILE"

explore_node() {
    local parent="$1"
    local indent="$2"
    
    RESPONSE=$(curl -s "https://api.dingtalk.com/v2.0/wiki/nodes?parentNodeId=${parent}&maxResults=50&operatorId=${UNION_ID}" \
        -H "Content-Type: application/json" \
        -H "x-acs-dingtalk-access-token: $TOKEN")
    
    if echo "$RESPONSE" | grep -q '"code"'; then
        echo "❌ API错误: $RESPONSE"
        return
    fi
    
    echo "$RESPONSE" | grep -o '"name":"[^"]*"' | sed 's/"name":"//;s/"$//' | while read -r name; do
        echo "${indent}📄 $name" | tee -a "$OUTPUT_FILE"
    done
    
    if echo "$RESPONSE" | grep -q '"type":"FOLDER"'; then
        echo "$RESPONSE" | grep -B20 '"type":"FOLDER"' | grep '"nodeId":"[^"]*"' | sed 's/.*"nodeId":"//;s/"$//' | while read -r folderId; do
            folderName=$(echo "$RESPONSE" | grep "$folderId" -B5 | grep '"name":"[^"]*"' | tail -1 | sed 's/.*"name":"//;s/"$//')
            echo "${indent}📁 $folderName" | tee -a "$OUTPUT_FILE"
            explore_node "$folderId" "${indent}  "
        done
    fi
}

{
    echo "========================================"
    echo "知识库结构: $WORKSPACE_ID"
    echo "根节点: $ROOT_NODE_ID"
    echo "========================================"
    echo ""
} >> "$OUTPUT_FILE"

explore_node "$ROOT_NODE_ID" ""

echo ""
echo "✅ 完成! 输出: $OUTPUT_FILE"
