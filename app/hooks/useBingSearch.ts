import { useState } from 'react';
import axios from 'axios';

interface BingSearchResult {
  name: string;
  url: string;
  snippet: string;
}

export const useBingSearch = () => {
  const [results, setResults] = useState<BingSearchResult[]>([]);
  const [analysis, setAnalysis] = useState<string>('');

  const search = async (userRequest: string) => {
    try {
      const { data: searchData } = await axios.post('/api/performBingSearch', {
        user_request: userRequest,
      });

      const searchResults = searchData.searchResults.map((result: any) => result.snippet).join('\n');
      setResults(searchData.searchResults);

      const { data: analysisData } = await axios.post('/api/processSearchResults', {
        user_request: userRequest,
        search_results: searchResults,
      });

      setAnalysis(analysisData.analysis);
    } catch (error) {
      console.error('Error during search and analysis:', error);
    }
  };

  return { results, analysis, search };
};
