import { apiClient } from './axios';
import { markdownToTipTap } from '../utils/markdownToTipTap';

/**
 * Article save payload
 */
export interface SaveArticlePayload {
  title: string;
  content: {
    type: 'doc';
    content: any[];
  };
  financer_id: string;
  language: string;
  illustration: string | null;
  status: 'draft' | 'published';
  tags: string[];
}

/**
 * Save article to the API
 * @param articleId - Article UUID
 * @param title - Article title
 * @param markdownContent - Article content in markdown format
 * @param financerId - Financer ID
 * @param language - Language code
 * @returns Promise with save response
 */
export const saveArticle = async (
  articleId: string,
  title: string,
  markdownContent: string,
  financerId: string,
  language: string = 'fr-BE'
): Promise<any> => {
  // Convert markdown to TipTap JSON
  const tipTapContent = markdownToTipTap(markdownContent);

  const payload: SaveArticlePayload = {
    title,
    content: tipTapContent,
    financer_id: financerId,
    language,
    illustration: null,
    status: 'draft',
    tags: [],
  };

  console.log('💾 Saving article:', articleId);
  console.log('📄 Payload:', JSON.stringify(payload, null, 2));

  const endpoint = `/internal-communication/articles/${articleId}`;
  const response = await apiClient.put(endpoint, payload);

  console.log('✅ Article saved successfully');
  return response.data;
};
