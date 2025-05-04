#!/bin/bash
set -e  # 遇到错误立即停止脚本执行

SOURCE_FILE="Module/Panel/IP-info/Moore/IP-1.js"
TARGET_FILES=(
  "Module/Panel/IP-info/Moore/IP-2.js"
  "Module/Panel/IP-info/Moore/IP-3.js"
  "Module/Panel/IP-info/Moore/IP-4.js"
)

echo "🔍 Source file: $SOURCE_FILE"

# 检查源文件是否存在
if [ ! -f "$SOURCE_FILE" ]; then
  echo "❌ Error: Source file $SOURCE_FILE does not exist!"
  exit 1
fi

# 使用 Node.js 提取函数，处理更复杂的情况
node -e "
  const fs = require('fs');
  const sourceCode = fs.readFileSync('$SOURCE_FILE', 'utf8');
  
  // 使用正则表达式匹配完整的 cleanIspInfo 函数
  const functionRegex = /function\s+cleanIspInfo[\s\S]*?^}/m;
  const match = sourceCode.match(functionRegex);
  
  if (!match) {
    console.error('❌ Error: cleanIspInfo function not found in source file!');
    process.exit(1);
  }
  
  fs.writeFileSync('/tmp/cleanIspInfo.js', match[0]);
  console.log('✅ Successfully extracted cleanIspInfo function');
"

# 显示提取的函数内容供确认
echo "📝 Extracted function:"
cat /tmp/cleanIspInfo.js

UPDATED_FILES=0

# 处理目标文件
for TARGET_FILE in "${TARGET_FILES[@]}"; do
  echo "🔄 Processing target file: $TARGET_FILE"
  
  # 检查目标文件是否存在
  if [ ! -f "$TARGET_FILE" ]; then
    echo "⚠️ Warning: Target file $TARGET_FILE does not exist, skipping..."
    continue
  fi
  
  # 创建临时文件
  TEMP_FILE="${TARGET_FILE}.tmp"
  
  # 使用 Node.js 替换函数，处理更复杂的情况
  node -e "
    const fs = require('fs');
    const targetCode = fs.readFileSync('$TARGET_FILE', 'utf8');
    const newFunction = fs.readFileSync('/tmp/cleanIspInfo.js', 'utf8');
    
    // 使用正则表达式替换函数
    const functionRegex = /function\s+cleanIspInfo[\s\S]*?^}/m;
    
    if (targetCode.match(functionRegex)) {
      // 如果找到函数，替换它
      const updatedCode = targetCode.replace(functionRegex, newFunction);
      fs.writeFileSync('$TEMP_FILE', updatedCode);
      console.log('✅ Function replaced');
    } else {
      // 如果没找到函数，添加到文件末尾
      fs.writeFileSync(
        '$TEMP_FILE', 
        targetCode + '\n\n// Added by sync workflow\n' + newFunction
      );
      console.log('✅ Function appended to file');
    }
  "
  
  # 检查文件是否有实际变化
  if cmp -s "$TARGET_FILE" "$TEMP_FILE"; then
    echo "ℹ️ No changes needed for $TARGET_FILE"
  else
    mv "$TEMP_FILE" "$TARGET_FILE"
    echo "✅ Updated $TARGET_FILE"
    UPDATED_FILES=$((UPDATED_FILES + 1))
  fi
done

echo "📊 Summary: Updated $UPDATED_FILES files"

# 只在有变更时提交
if [ $UPDATED_FILES -gt 0 ]; then
  echo "🚀 Changes detected, preparing to commit..."
  exit 0  # 有变更，返回成功状态码
else
  echo "ℹ️ No changes detected"
  exit 0  # 无变更，返回成功状态码
fi
