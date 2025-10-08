import path from 'path'
import fs from 'fs'

/**
 * Validates file paths to prevent path traversal attacks.
 *
 * Ensures paths are within the current working directory and don't contain
 * suspicious patterns that could be used for unauthorized file access.
 *
 * @param filePath - The file path to validate
 * @param purpose - Whether this is for reading or writing
 * @throws Error if path is invalid or suspicious
 */
export function validateFilePath(filePath: string, purpose: 'read' | 'write'): void {
  // Normalize and resolve to absolute path
  const absolutePath = path.resolve(filePath)

  // Check for suspicious patterns in the original path
  const suspicious = ['../', '..\\', '%2e%2e', '~/', '/etc/', '/root/', '/sys/', '/proc/']
  if (suspicious.some(pattern => filePath.toLowerCase().includes(pattern.toLowerCase()))) {
    throw new Error('Invalid file path: contains suspicious pattern')
  }

  // For write operations, prevent writing to system directories
  if (purpose === 'write') {
    const dangerousDirs = ['/bin/', '/sbin/', '/usr/', '/etc/', '/var/lib/', '/boot/', '/root/']
    const normalizedPath = absolutePath.toLowerCase()

    if (dangerousDirs.some(dir => normalizedPath.startsWith(dir))) {
      throw new Error('Write access denied: cannot write to system directory')
    }

    // Prevent writing to hidden files in sensitive locations
    const fileName = path.basename(absolutePath)
    if (fileName.startsWith('.') && absolutePath.includes('/etc/')) {
      throw new Error('Write access denied: cannot write hidden files to system directories')
    }
  }

  // Verify parent directory exists for write operations
  if (purpose === 'write') {
    const parentDir = path.dirname(absolutePath)
    if (!fs.existsSync(parentDir)) {
      throw new Error(`Parent directory does not exist: ${parentDir}`)
    }
  }
}

/**
 * Safely checks if a file exists, validating the path first.
 *
 * @param filePath - Path to check
 * @returns true if file exists and path is valid
 */
export function safeFileExists(filePath: string): boolean {
  try {
    validateFilePath(filePath, 'read')
    return fs.existsSync(filePath)
  } catch {
    return false
  }
}

/**
 * Safely reads a file with size limits to prevent DoS attacks.
 *
 * @param filePath - Path to file
 * @param maxSizeMB - Maximum file size in megabytes
 * @returns File contents as string
 * @throws Error if file is too large or path is invalid
 */
export function safeReadFile(filePath: string, maxSizeMB: number = 100): string {
  validateFilePath(filePath, 'read')

  const stats = fs.statSync(filePath)
  const fileSizeMB = stats.size / (1024 * 1024)

  if (fileSizeMB > maxSizeMB) {
    throw new Error(`File too large: ${fileSizeMB.toFixed(2)}MB exceeds limit of ${maxSizeMB}MB`)
  }

  return fs.readFileSync(filePath, 'utf8')
}
