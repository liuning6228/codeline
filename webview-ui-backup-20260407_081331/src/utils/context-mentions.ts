/**
 * Context Mentions Utility Functions
 * Handles @mentions for files, URLs, problems, etc.
 */

/**
 * Mention regex pattern
 * Matches: @/path/to/file, @url, @problems, etc.
 */
export const mentionRegex = /@[^\s]+/g

/**
 * Search result interface
 */
export interface SearchResult {
  path: string
  type: 'file' | 'folder'
  label?: string
  workspaceName?: string
}

/**
 * Insert a mention at the specified position
 */
export function insertMention(
  text: string,
  position: number,
  value: string,
  partialQueryLength: number = 0,
): { newValue: string; mentionIndex: number } {
  const beforeCursor = text.slice(0, position)
  const afterCursor = text.slice(position)

  const lastAtIndex = beforeCursor.lastIndexOf('@')

  // For file/folder paths that contain spaces, wrap them in quotes
  let formattedValue = value
  if (value.startsWith('/') && value.includes(' ')) {
    formattedValue = `"${value}"`
  }
  let newValue: string
  let mentionIndex: number

  if (lastAtIndex !== -1) {
    const beforeAt = text.substring(0, lastAtIndex + 1)
    const afterPartialQuery = text.substring(lastAtIndex + 1 + partialQueryLength)

    newValue = beforeAt + formattedValue + (afterPartialQuery.startsWith(' ') ? afterPartialQuery : ' ' + afterPartialQuery)
    mentionIndex = lastAtIndex
  } else {
    newValue = beforeCursor + '@' + formattedValue + ' ' + afterCursor
    mentionIndex = position
  }

  return { newValue, mentionIndex }
}

/**
 * Insert a mention directly at position
 */
export function insertMentionDirectly(
  text: string,
  position: number,
  value: string,
): { newValue: string; mentionIndex: number } {
  const beforeCursor = text.slice(0, position)
  const afterCursor = text.slice(position)

  let formattedValue = value
  if (value.startsWith('/') && value.includes(' ')) {
    formattedValue = `"${value}"`
  }

  const newValue = beforeCursor + '@' + formattedValue + ' ' + afterCursor
  const mentionIndex = position
  return { newValue, mentionIndex }
}

/**
 * Remove a mention at the specified position
 */
export function removeMention(text: string, position: number): { newText: string; newPosition: number } {
  const beforeCursor = text.slice(0, position)
  const afterCursor = text.slice(position)

  const matchEnd = beforeCursor.match(new RegExp(mentionRegex.source + '$'))

  if (matchEnd) {
    const newText = text.slice(0, position - matchEnd[0].length) + afterCursor.replace(' ', '')
    const newPosition = position - matchEnd[0].length
    return { newText, newPosition }
  }

  return { newText: text, newPosition: position }
}

/**
 * Context menu option types
 */
export enum ContextMenuOptionType {
  File = 'file',
  Folder = 'folder',
  Problems = 'problems',
  Terminal = 'terminal',
  URL = 'url',
  Git = 'git',
  NoResults = 'noResults',
}

/**
 * Context menu query item interface
 */
export interface ContextMenuQueryItem {
  type: ContextMenuOptionType
  value?: string
  label?: string
  description?: string
  workspaceName?: string
}

/**
 * Get context menu options based on query
 */
export function getContextMenuOptions(
  query: string,
  selectedType: ContextMenuOptionType | null = null,
  queryItems: ContextMenuQueryItem[] = [],
  dynamicSearchResults: SearchResult[] = [],
): ContextMenuQueryItem[] {
  const workingChanges: ContextMenuQueryItem = {
    type: ContextMenuOptionType.Git,
    value: 'git-changes',
    label: 'Working changes',
    description: 'Current uncommitted changes',
  }

  const searchResultItems: ContextMenuQueryItem[] = dynamicSearchResults.map((result) => {
    const formattedPath = result.path.startsWith('/') ? result.path : `/${result.path}`
    return {
      type: result.type === 'folder' ? ContextMenuOptionType.Folder : ContextMenuOptionType.File,
      value: formattedPath,
      label: result.label,
      description: formattedPath,
      workspaceName: result.workspaceName,
    }
  })

  if (query === '') {
    if (selectedType === ContextMenuOptionType.File) {
      const files = searchResultItems.filter((item) => item.type === ContextMenuOptionType.File)
      return files.length > 0 ? files : [{ type: ContextMenuOptionType.NoResults }]
    }

    if (selectedType === ContextMenuOptionType.Folder) {
      const folders = searchResultItems.filter((item) => item.type !== ContextMenuOptionType.File)
      return folders.length > 0 ? folders : [{ type: ContextMenuOptionType.NoResults }]
    }

    if (selectedType === ContextMenuOptionType.Git) {
      const commits = queryItems.filter((item) => item.type === ContextMenuOptionType.Git)
      return commits.length > 0 ? [workingChanges, ...commits] : [workingChanges]
    }

    return [
      { type: ContextMenuOptionType.URL },
      { type: ContextMenuOptionType.Problems },
      { type: ContextMenuOptionType.Git },
      { type: ContextMenuOptionType.Folder },
      { type: ContextMenuOptionType.File },
    ]
  }

  const lowerQuery = query.toLowerCase()
  const suggestions: ContextMenuQueryItem[] = []

  if ('git'.startsWith(lowerQuery)) {
    suggestions.push({
      type: ContextMenuOptionType.Git,
      label: 'Git Commits',
      description: 'Search repository history',
    })
  } else if ('git-changes'.startsWith(lowerQuery)) {
    suggestions.push(workingChanges)
  }
  if ('problems'.startsWith(lowerQuery)) {
    suggestions.push({ type: ContextMenuOptionType.Problems })
  }
  if (query.startsWith('http')) {
    suggestions.push({ type: ContextMenuOptionType.URL, value: query })
  }

  // Simple fuzzy matching for files/folders
  const matchingItems = queryItems.filter((item) => {
    const searchStr = [item.value, item.label, item.description].filter(Boolean).join(' ').toLowerCase()
    return searchStr.includes(lowerQuery) || lowerQuery.includes(item.value?.toLowerCase() || '')
  })

  if (dynamicSearchResults.length > 0) {
    let filteredDynamic: ContextMenuQueryItem[]
    if (selectedType === ContextMenuOptionType.Folder) {
      filteredDynamic = searchResultItems.filter((item) => item.type === ContextMenuOptionType.Folder)
    } else if (selectedType === ContextMenuOptionType.File) {
      filteredDynamic = searchResultItems.filter((item) => item.type === ContextMenuOptionType.File)
    } else {
      filteredDynamic = searchResultItems
    }

    const allItems = [...suggestions, ...filteredDynamic]
    return allItems.length > 0 ? allItems : [{ type: ContextMenuOptionType.NoResults }]
  }

  if (suggestions.length > 0 || matchingItems.length > 0) {
    const allItems = [...suggestions, ...matchingItems]
    return allItems.length > 0 ? allItems : [{ type: ContextMenuOptionType.NoResults }]
  }

  return [{ type: ContextMenuOptionType.NoResults }]
}

/**
 * Check if context menu should be shown
 */
export function shouldShowContextMenu(text: string, position: number): boolean {
  const beforeCursor = text.slice(0, position)
  const atIndex = beforeCursor.lastIndexOf('@')

  if (atIndex === -1) {
    return false
  }

  const textAfterAt = beforeCursor.slice(atIndex + 1)

  // Check if there's any whitespace after the '@'
  if (/\s/.test(textAfterAt)) {
    return false
  }

  // Don't show the menu if it's a URL
  if (textAfterAt.toLowerCase().startsWith('http')) {
    return false
  }

  // Don't show the menu if it's a problems or terminal
  if (textAfterAt.toLowerCase().startsWith('problems') || textAfterAt.toLowerCase().startsWith('terminal')) {
    return false
  }

  return true
}

/**
 * Parse mentions from text
 */
export function parseMentions(text: string): string[] {
  const matches = text.match(mentionRegex)
  return matches ? matches.map((m) => m.slice(1)) : []
}

/**
 * Check if a string is a valid mention
 */
export function isValidMention(value: string): boolean {
  // File path
  if (value.startsWith('/')) {
    return true
  }
  // URL
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return true
  }
  // Special mentions
  if (['problems', 'terminal', 'git-changes'].includes(value.toLowerCase())) {
    return true
  }
  // Git commit hash
  if (/^[a-f0-9]{7,40}$/i.test(value)) {
    return true
  }
  return false
}
