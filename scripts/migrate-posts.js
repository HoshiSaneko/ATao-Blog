import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 日期格式转换：2025-03-09 22:44:23 -> 2025年03月09日
function convertDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '年').replace(/(\d+年\d+月)(\d+)/, '$1$2日');
  
  // 处理 ISO 格式：2025-03-09 22:44:23 或 2025-03-09
  const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${year}年${month}月${day}日`;
  }
  
  // 如果已经是中文格式，直接返回
  if (dateStr.includes('年') && dateStr.includes('月')) {
    return dateStr;
  }
  
  return new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '年').replace(/(\d+年\d+月)(\d+)/, '$1$2日');
}

// 转换图片语法：::pic ... ::: 转为 ![alt](url){caption:说明}
function convertImageSyntax(content) {
  // 处理 ::pic 语法
  // 格式1: ::pic\n---\nsrc: url\ncaption: text\n---\n::
  content = content.replace(/::pic\s*\r?\n---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n::/g, (match, attrs) => {
    const srcMatch = attrs.match(/src:\s*(.+)/);
    const captionMatch = attrs.match(/caption:\s*(.+)/);
    const altMatch = attrs.match(/alt:\s*(.+)/);
    
    const src = srcMatch ? srcMatch[1].trim() : '';
    const caption = captionMatch ? captionMatch[1].trim() : '';
    const alt = altMatch ? altMatch[1].trim() : caption || '图片';
    
    if (!src) return match;
    
    if (caption) {
      return `![${alt}](${src}){caption:${caption}}`;
    }
    return `![${alt}](${src})`;
  });
  
  // 处理其他可能的图片格式
  // 格式2: ![alt](url) 保持不变，但可能需要添加 caption
  return content;
}

// 转换 frontmatter
function convertFrontmatter(frontmatter) {
  const lines = frontmatter.split('\n');
  const data = {};
  
  lines.forEach(line => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      // 处理数组值
      if (value.startsWith('[') && value.endsWith(']')) {
        data[key] = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      } else {
        data[key] = value.trim().replace(/^["']|["']$/g, '');
      }
    }
  });
  
  // 构建新的 frontmatter
  const title = data.title || '未命名文章';
  const date = convertDate(data.date);
  
  // 合并 categories 和 tags
  const tags = [];
  if (data.categories && Array.isArray(data.categories)) {
    tags.push(...data.categories);
  }
  if (data.tags && Array.isArray(data.tags)) {
    tags.push(...data.tags);
  }
  // 去重
  const uniqueTags = [...new Set(tags)];
  
  const summary = data.description || data.summary || '';
  const readingTime = data.readingTime || '';
  
  let newFrontmatter = `---
title: ${title}
date: '${date}'
tags: [${uniqueTags.map(t => `'${t}'`).join(', ')}]
summary: ${summary}`;
  
  if (readingTime) {
    newFrontmatter += `\nreadingTime: '${readingTime}'`;
  }
  
  newFrontmatter += '\n---\n';
  
  return newFrontmatter;
}

// 处理单个文件
function processFile(sourcePath, targetDir) {
  try {
    const content = fs.readFileSync(sourcePath, 'utf-8');
    
    // 分离 frontmatter 和 body
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      console.log(`跳过 ${sourcePath}：没有找到 frontmatter`);
      return;
    }
    
    const [, frontmatter, body] = frontmatterMatch;
    
    // 转换 frontmatter
    const newFrontmatter = convertFrontmatter(frontmatter);
    
    // 转换内容
    let newBody = convertImageSyntax(body);
    
    // 组合新内容
    const newContent = newFrontmatter + newBody;
    
    // 确定目标文件路径
    const relativePath = path.relative(path.join(__dirname, '../posts'), sourcePath);
    const targetPath = path.join(targetDir, relativePath);
    const targetDirPath = path.dirname(targetPath);
    
    // 创建目标目录
    if (!fs.existsSync(targetDirPath)) {
      fs.mkdirSync(targetDirPath, { recursive: true });
    }
    
    // 写入文件
    fs.writeFileSync(targetPath, newContent, 'utf-8');
    console.log(`✓ 已转换: ${relativePath}`);
  } catch (error) {
    console.error(`✗ 处理 ${sourcePath} 时出错:`, error.message);
  }
}

// 递归查找所有 .md 文件
function findMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 主函数
function main() {
  const postsDir = path.join(__dirname, '../posts');
  const targetDir = path.join(__dirname, '../src/content/blog');
  
  if (!fs.existsSync(postsDir)) {
    console.error('posts 目录不存在！');
    process.exit(1);
  }
  
  // 创建目标目录
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // 查找所有 markdown 文件
  const markdownFiles = findMarkdownFiles(postsDir);
  
  console.log(`找到 ${markdownFiles.length} 个 Markdown 文件\n`);
  
  // 处理每个文件
  markdownFiles.forEach(file => {
    processFile(file, targetDir);
  });
  
  console.log(`\n完成！已转换 ${markdownFiles.length} 个文件`);
}

main();

