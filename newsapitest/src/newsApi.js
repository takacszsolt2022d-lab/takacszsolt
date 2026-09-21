require('dotenv').config();

async function getTopHeadlines({ apiKey = process.env.NEWS_API_KEY, country = 'us', pageSize = 10, q } = {}) {
  if (!apiKey) {
    throw new Error('NEWS_API_KEY is required');
  }

  const params = new URLSearchParams({
    country,
    pageSize: String(pageSize),
  });

  if (q) {
    params.set('q', q);
  }

  const response = await fetch(`https://newsapi.org/v2/top-headlines?${params.toString()}`, {
    headers: {
      'X-API-KEY': apiKey,
      Accept: 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'NewsAPI request failed');
  }

  return data.articles || [];
}

module.exports = { getTopHeadlines };
