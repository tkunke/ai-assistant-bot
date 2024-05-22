'use client';

import React, { useState } from 'react';
import { useBingSearch } from '../hooks/useBingSearch';

const BingSearchComponent = () => {
  const [userRequest, setUserRequest] = useState('');
  const { results, analysis, search } = useBingSearch();

  const handleSearch = async () => {
    await search(userRequest);
  };

  return (
    <div>
      <input
        type="text"
        value={userRequest}
        onChange={(e) => setUserRequest(e.target.value)}
        placeholder="Enter your search query"
      />
      <button onClick={handleSearch}>Search</button>
      {results.length > 0 && (
        <div>
          <h3>Search Results:</h3>
          <pre>{results.map(result => result.snippet).join('\n')}</pre>
        </div>
      )}
      {analysis && (
        <div>
          <h3>Analysis:</h3>
          <pre>{analysis}</pre>
        </div>
      )}
    </div>
  );
};

export default BingSearchComponent;
