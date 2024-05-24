import axios from 'axios';
import { stringify } from 'querystring';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface BingSearchResult {
  name: string;
  url: string;
  snippet: string;
}

export const performBingSearch = async (user_request: string): Promise<BingSearchResult[]> => {
  console.log('performBingSearch called with:', user_request);
  const openaiKey = process.env.OPENAI_API_KEY as string;
  const bingApiKey = process.env.BING_API_KEY as string;

  //console.log('OpenAI API Key:', openaiKey ? 'Set' : 'Not Set');
  //console.log('Bing API Key:', bingApiKey ? 'Set' : 'Not Set');

  if (!openaiKey || !bingApiKey) {
    throw new Error('API keys are not set in the environment variables');
  }

  // Generate search query using OpenAI
  const promptInput = `Generate a search-engine query to satisfy this user's request: ${user_request}`;
  const openaiResponse = await axios.post<OpenAIResponse>(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o', // Replace with the appropriate model name
      messages: [{ role: 'user', content: promptInput }],
    },
    {
      headers: {
        Authorization: `Bearer ${openaiKey}`,
      },
    }
  );

  const bingQuery = openaiResponse.data.choices[0].message.content;
  console.log(`Bing search query: ${bingQuery}. Now executing the search...`);

  // Perform Bing search
  const bingResponse = await runBingSearch(bingQuery, bingApiKey);

  return bingResponse;
};

const runBingSearch = async (searchQuery: string, bingApiKey: string): Promise<BingSearchResult[]> => {
  const baseUrl = 'https://api.bing.microsoft.com/v7.0/search';
  const encodedQuery = stringify({ q: searchQuery });
  const bingSearchQuery = `${baseUrl}?${encodedQuery}`;

  console.log(`Bing search query URL: ${bingSearchQuery}`);

  try {
    const response = await axios.get(bingSearchQuery, {
      headers: {
        'Ocp-Apim-Subscription-Key': bingApiKey,
      },
    });

    //console.log('Bing API response status:', response.status);
    //console.log('Bing API response data:', JSON.stringify(response.data, null, 2));

    const responseData = response.data;

    let searchResults: BingSearchResult[] = [];

    if (responseData.webPages && responseData.webPages.value) {
      searchResults = responseData.webPages.value.map((result: any) => ({
        name: result.name,
        url: result.url,
        snippet: result.snippet,
      }));
    } else if (responseData.videos && responseData.videos.value) {
      searchResults = responseData.videos.value.map((result: any) => ({
        name: result.name,
        url: result.contentUrl,
        snippet: result.description,
      }));
    } else if (responseData.news && responseData.news.value) {
      searchResults = responseData.news.value.map((result: any) => ({
        name: result.name,
        url: result.url,
        snippet: result.description,
      }));
    } else if (responseData.images && responseData.images.value) {
      searchResults = responseData.images.value.map((result: any) => ({
        name: result.name,
        url: result.contentUrl,
        snippet: result.hostPageDisplayUrl,
      }));
    } else {
      console.warn('No relevant results found in the Bing search response:', responseData);
      return [];
    }

    return searchResults;
  } catch (error: any) {
    console.error('Encountered exception during Bing search:', error.message);
    console.error('Bing API response:', error.response?.data);
    throw error;
  }
};
