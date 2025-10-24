import type { MessageSections } from '../types';

/**
 * Parse XML-formatted response into structured sections
 * Uses DOMParser for robust parsing with automatic HTML entity unescaping
 *
 * @param response - Raw response string containing XML tags
 * @returns Parsed sections object with opening, title, content, and closing
 * @throws Error if required sections are missing
 */
export const parseXmlResponse = (response: string): MessageSections => {
  try {
    // Wrap response in root element for proper XML parsing
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<root>${response}</root>`, 'text/xml');

    // Check for XML parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent);
      throw new Error('Failed to parse XML response');
    }

    // Extract sections
    const sections: MessageSections = {
      opening: doc.querySelector('opening')?.textContent?.trim() || '',
      title: doc.querySelector('title')?.textContent?.trim() || '',
      content: doc.querySelector('content')?.textContent?.trim() || '',
      closing: doc.querySelector('closing')?.textContent?.trim() || '',
    };

    // Validate required sections
    const requiredSections: (keyof MessageSections)[] = ['opening', 'title', 'content', 'closing'];
    const missingSections = requiredSections.filter(section => !sections[section]);

    if (missingSections.length > 0) {
      console.error('Missing sections:', missingSections);
      throw new Error(`Sections manquantes: ${missingSections.join(', ')}`);
    }

    return sections;
  } catch (error) {
    console.error('Error parsing XML response:', error);
    throw error;
  }
};

/**
 * Check if a response string contains XML tags
 * Used to determine if parsing is needed
 *
 * @param response - Response string to check
 * @returns True if response contains XML tags
 */
export const isXmlResponse = (response: string): boolean => {
  return response.includes('<opening>') ||
         response.includes('<title>') ||
         response.includes('<content>') ||
         response.includes('<closing>');
};
