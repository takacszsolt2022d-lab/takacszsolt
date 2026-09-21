const { getTopHeadlines } = require('../src/newsApi');

describe('NewsAPI client', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('returns top headlines from the API response', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        articles: [{ title: 'Example headline', source: { name: 'Test News' } }],
      }),
    });

    const articles = await getTopHeadlines({
      apiKey: 'demo-key',
      country: 'us',
      pageSize: 5,
      q: 'technology',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('https://newsapi.org/v2/top-headlines?'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-API-KEY': 'demo-key' }),
      }),
    );
    expect(articles).toEqual([
      { title: 'Example headline', source: { name: 'Test News' } },
    ]);
  });

  test('throws when no API key is provided', async () => {
    const originalApiKey = process.env.NEWS_API_KEY;
    delete process.env.NEWS_API_KEY;

    try {
      await expect(getTopHeadlines({})).rejects.toThrow('NEWS_API_KEY is required');
    } finally {
      if (originalApiKey === undefined) {
        delete process.env.NEWS_API_KEY;
      } else {
        process.env.NEWS_API_KEY = originalApiKey;
      }
    }
  });

  test('throws when the API responds with an error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Your API key is invalid' }),
    });

    await expect(
      getTopHeadlines({ apiKey: 'bad-key', country: 'us' }),
    ).rejects.toThrow('Your API key is invalid');
  });

  test('integration: fetches live headlines when NEWS_API_KEY is configured', async () => {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      return;
    }

    const articles = await getTopHeadlines({
      apiKey,
      country: 'us',
      pageSize: 3,
    });

    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBeGreaterThan(0);
    expect(articles[0]).toHaveProperty('title');
  }, 20000);
});
