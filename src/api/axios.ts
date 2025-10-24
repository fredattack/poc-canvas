import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Get configuration from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Create axios instance with base configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Storage key for auth token
const TOKEN_STORAGE_KEY = 'auth_token';

// Get token from storage
export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

// Save token to storage
export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

// Remove token from storage
export const removeStoredToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

// Request interceptor to inject authorization token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized - could trigger logout
    if (error.response?.status === 401) {
      // Token might be invalid, could trigger logout event here
      console.warn('Unauthorized request, token may be invalid');
    }
    return Promise.reject(error);
  }
);

// Setup mock adapter if enabled
if (USE_MOCKS) {
  console.log('🔧 Mock API adapter enabled');

  // Simple mock adapter implementation
  const mockAdapter = async (config: InternalAxiosRequestConfig): Promise<any> => {
    const url = config.url || '';
    const method = config.method?.toUpperCase();

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));

    // Mock login endpoint
    if (url.includes('/login') && method === 'POST') {
      const data = JSON.parse(config.data || '{}');

      if (data.email === 'user@example.com' && data.password === 'secret123') {
        return {
          data: {
            token: 'mock_jwt_token_' + Date.now(),
            user: {
              id: 'u_123',
              email: data.email,
            },
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      } else {
        throw {
          response: {
            data: { error: 'Invalid credentials' },
            status: 401,
            statusText: 'Unauthorized',
            headers: {},
            config,
          },
          isAxiosError: true,
        };
      }
    }

    // Mock chat endpoint - internal-communication/articles/{uuid}/chat
    if (url.includes('/internal-communication/articles/') && url.includes('/chat') && method === 'PUT') {
      // Check for authorization header
      if (!config.headers?.Authorization) {
        throw {
          response: {
            data: { error: 'Unauthorized' },
            status: 401,
            statusText: 'Unauthorized',
            headers: {},
            config,
          },
          isAxiosError: true,
        };
      }

      const data = JSON.parse(config.data || '{}');
      const userPrompt = data.prompt || '';
      const selectedText = data.selected_text || '';
      const language = data.language || 'fr-BE';

      // Generate mock XML response
      const mockResponse = `<opening>
Je comprends votre demande concernant: "${userPrompt}"
</opening>

<title>
# Réponse à votre question
</title>

<content>
## Contexte

${selectedText ? `Texte sélectionné: "${selectedText}"\n\n` : ''}Voici une réponse détaillée à votre question. Cette réponse est générée en mode mock pour le développement.

### Points clés

- **Point 1**: Premier aspect important de la réponse
- **Point 2**: Deuxième élément à considérer
- **Point 3**: Troisième point pertinent

## Détails supplémentaires

Dans un environnement de production, cette réponse serait générée par un LLM basé sur votre prompt et le contexte fourni. La langue de la réponse est: ${language}.

\`\`\`javascript
// Exemple de code
const response = processPrompt("${userPrompt}");
console.log(response);
\`\`\`
</content>

<closing>
Souhaitez-vous que je développe un aspect spécifique de cette réponse?
</closing>`;

      return {
        data: {
          assistant: mockResponse,
          conversationId: url.match(/articles\/([^\/]+)/)?.[1] || 'article_001',
          canvasContent: `# Canvas Content\n\nGenerated from: "${userPrompt}"\n\n## Sample Code\n\n\`\`\`javascript\nconst result = processPrompt("${userPrompt}");\nconsole.log(result);\n\`\`\`\n\n## Notes\n\n- Language: ${language}\n- Selected text: ${selectedText || 'None'}\n- This is sample canvas content`,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // Unknown endpoint
    throw {
      response: {
        data: { error: 'Not found' },
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config,
      },
      isAxiosError: true,
    };
  };

  // Override the request method to use mock adapter
  apiClient.request = function(config: any) {
    return mockAdapter(config);
  } as any;
}

export default apiClient;
