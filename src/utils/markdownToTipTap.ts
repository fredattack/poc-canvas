/**
 * Convert markdown content to TipTap JSON format
 */

interface TipTapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  text?: string;
  marks?: Array<{ type: string }>;
}

interface TipTapDocument {
  type: 'doc';
  content: TipTapNode[];
}

/**
 * Convert markdown text to TipTap JSON document
 * @param markdown - Markdown string
 * @returns TipTap JSON document
 */
export const markdownToTipTap = (markdown: string): TipTapDocument => {
  const lines = markdown.split('\n');
  const content: TipTapNode[] = [];
  let currentList: TipTapNode | null = null;
  let currentListType: 'bulletList' | 'orderedList' | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      // Close any open list
      if (currentList) {
        content.push(currentList);
        currentList = null;
        currentListType = null;
      }
      continue;
    }

    // Heading level 2
    if (trimmed.startsWith('## ')) {
      if (currentList) {
        content.push(currentList);
        currentList = null;
        currentListType = null;
      }
      content.push({
        type: 'heading',
        attrs: { textAlign: null, level: 2 },
        content: parseInlineContent(trimmed.substring(3)),
      });
      continue;
    }

    // Heading level 3
    if (trimmed.startsWith('### ')) {
      if (currentList) {
        content.push(currentList);
        currentList = null;
        currentListType = null;
      }
      content.push({
        type: 'heading',
        attrs: { textAlign: null, level: 3 },
        content: parseInlineContent(trimmed.substring(4)),
      });
      continue;
    }

    // Bullet list item
    if (trimmed.startsWith('- ')) {
      const itemContent = trimmed.substring(2);
      const listItem: TipTapNode = {
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            attrs: { textAlign: null },
            content: parseInlineContent(itemContent),
          },
        ],
      };

      if (currentListType !== 'bulletList') {
        if (currentList) {
          content.push(currentList);
        }
        currentList = {
          type: 'bulletList',
          content: [listItem],
        };
        currentListType = 'bulletList';
      } else {
        currentList!.content!.push(listItem);
      }
      continue;
    }

    // Ordered list item (1. 2. 3. etc)
    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (orderedMatch) {
      const itemContent = orderedMatch[2];
      const listItem: TipTapNode = {
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            attrs: { textAlign: null },
            content: parseInlineContent(itemContent),
          },
        ],
      };

      if (currentListType !== 'orderedList') {
        if (currentList) {
          content.push(currentList);
        }
        currentList = {
          type: 'orderedList',
          attrs: { start: 1, type: null },
          content: [listItem],
        };
        currentListType = 'orderedList';
      } else {
        currentList!.content!.push(listItem);
      }
      continue;
    }

    // Code block
    if (trimmed.startsWith('```')) {
      if (currentList) {
        content.push(currentList);
        currentList = null;
        currentListType = null;
      }
      // Skip code blocks for now
      continue;
    }

    // Regular paragraph
    if (currentList) {
      content.push(currentList);
      currentList = null;
      currentListType = null;
    }
    content.push({
      type: 'paragraph',
      attrs: { textAlign: null },
      content: parseInlineContent(trimmed),
    });
  }

  // Close any remaining list
  if (currentList) {
    content.push(currentList);
  }

  return {
    type: 'doc',
    content,
  };
};

/**
 * Parse inline content (bold, italic, links, etc.)
 * @param text - Text to parse
 * @returns Array of TipTap text nodes with marks
 */
const parseInlineContent = (text: string): TipTapNode[] => {
  const nodes: TipTapNode[] = [];

  // Split by bold markers **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith('**') && part.endsWith('**')) {
      // Bold text
      const boldText = part.slice(2, -2);

      // Check if there's text after the bold marker (e.g., "**Bold** : rest of text")
      if (boldText.includes('** :') || boldText.includes('**:')) {
        // Split bold and regular text
        const splitMatch = boldText.match(/^(.+?)(?:\*\* :|:\*\*)/);
        if (splitMatch) {
          nodes.push({
            type: 'text',
            marks: [{ type: 'bold' }],
            text: splitMatch[1],
          });
          // Get the rest of the text
          const remaining = part.substring(part.indexOf(':') + 1).trim();
          if (remaining) {
            nodes.push({
              type: 'text',
              text: ' : ' + remaining,
            });
          }
        } else {
          nodes.push({
            type: 'text',
            marks: [{ type: 'bold' }],
            text: boldText,
          });
        }
      } else {
        nodes.push({
          type: 'text',
          marks: [{ type: 'bold' }],
          text: boldText,
        });
      }
    } else {
      // Check if this part contains " : " after a bold section
      const colonMatch = part.match(/^(\s*:\s*)(.+)$/);
      if (colonMatch && nodes.length > 0 && nodes[nodes.length - 1].marks) {
        // This is continuation after bold text
        nodes.push({
          type: 'text',
          text: colonMatch[1] + colonMatch[2],
        });
      } else if (part.trim()) {
        // Regular text
        nodes.push({
          type: 'text',
          text: part,
        });
      }
    }
  }

  return nodes.length > 0 ? nodes : [{ type: 'text', text }];
};
