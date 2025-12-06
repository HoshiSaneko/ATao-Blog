import crypto from 'crypto';

/**
 * 基于文件路径生成一个固定的短随机ID
 * 使用文件路径的hash值，确保每次构建时ID都相同
 * @param filePath 文件路径（相对于content/blog的路径）
 * @param length ID长度，默认8位
 * @returns 短随机ID（小写字母和数字）
 */
export function generateShortId(filePath: string, length: number = 8): string {
  // 使用文件路径生成hash
  const hash = crypto.createHash('md5').update(filePath).digest('hex');
  
  // 取前length个字符作为短ID
  return hash.substring(0, length);
}

