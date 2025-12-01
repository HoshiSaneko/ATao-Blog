
export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const charsPerMinute = 500; // Chinese reading speed estimation

  // Remove HTML tags and Markdown syntax roughly to get text content
  const cleanContent = content
    .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML
    .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
    .replace(/\[.*?\]\(.*?\)/g, "") // Remove links
    .replace(/#{1,6}\s/g, "") // Remove headers
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // Remove bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // Remove italic
    .replace(/`{3}[\s\S]*?`{3}/g, "") // Remove code blocks
    .replace(/`(.+?)`/g, "$1"); // Remove inline code

  // Count Chinese characters
  const chineseChars = (cleanContent.match(/[\u4e00-\u9fa5]/g) || []).length;
  
  // Count non-Chinese words
  // Replace Chinese characters with spaces to count remaining words
  const nonChineseContent = cleanContent.replace(/[\u4e00-\u9fa5]/g, " ");
  const nonChineseWords = nonChineseContent.split(/\s+/).filter(word => word.length > 0).length;

  const minutes = (chineseChars / charsPerMinute) + (nonChineseWords / wordsPerMinute);
  const readTime = Math.ceil(minutes);

  // Minimum 1 minute
  return `${Math.max(1, readTime)} 分钟阅读`;
}

