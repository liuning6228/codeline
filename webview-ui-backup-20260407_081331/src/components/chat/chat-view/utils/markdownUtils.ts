/**
 * Utility functions for handling markdown conversions and cleanup
 */

/**
 * Clean up markdown escape characters
 */
export function cleanupMarkdownEscapes(markdown: string): string {
  return (
    markdown
      // Handle underscores and asterisks (single or multiple)
      .replace(/\\([_*]+)/g, '$1')

      // Handle angle brackets (for generics and XML)
      .replace(/\\([<>])/g, '$1')

      // Handle backticks (for code)
      .replace(/\\(`)/g, '$1')

      // Handle other common markdown special characters
      .replace(/\\([[\]()#.!])/g, '$1')

      // Fix multiple consecutive backslashes
      .replace(/\\{2,}([_*`<>[\]()#.!])/g, '$1')
  )
}

/**
 * Simple HTML to Markdown conversion
 * For more complex conversions, consider using a library like unified/turndown
 */
export function convertHtmlToMarkdown(html: string): string {
  let md = html
    // Headers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    // Bold and italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Images
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)')
    // Code blocks
    .replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    // Lists
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, '$1\n')
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, '$1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    // Paragraphs and breaks
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<div[^>]*>(.*?)<\/div>/gis, '$1\n')
    // Blockquotes
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '> $1\n\n')
    // Horizontal rules
    .replace(/<hr\s*\/?>/gi, '\n---\n')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return cleanupMarkdownEscapes(md)
}

/**
 * Escape markdown special characters
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/([_*`[\]()#.!<>\\])/g, '\\$1')
}

/**
 * Truncate markdown content to a maximum length
 */
export function truncateMarkdown(markdown: string, maxLength: number = 500): string {
  if (markdown.length <= maxLength) {
    return markdown
  }
  
  // Try to truncate at a word boundary
  const truncated = markdown.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}
