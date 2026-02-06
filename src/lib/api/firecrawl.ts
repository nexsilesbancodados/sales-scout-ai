import { supabase } from '@/integrations/supabase/client';

type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  data?: T;
  results?: any[];
};

type ScrapeOptions = {
  formats?: ('markdown' | 'html' | 'links' | 'screenshot')[];
  onlyMainContent?: boolean;
  waitFor?: number;
};

type SearchOptions = {
  limit?: number;
  lang?: string;
  country?: string;
  tbs?: string;
  scrapeOptions?: { formats?: ('markdown' | 'html')[] };
};

type MapOptions = {
  search?: string;
  limit?: number;
  includeSubdomains?: boolean;
};

export const firecrawlApi = {
  // Scrape a single URL
  async scrape(url: string, options?: ScrapeOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Search the web and optionally scrape results
  async search(query: string, options?: SearchOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { query, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Map a website to discover all URLs (fast sitemap)
  async map(url: string, options?: MapOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-map', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};

export const webSearchApi = {
  // Google Search via SerpAPI
  async search(query: string, location?: string, options?: { num_results?: number; search_type?: 'google' | 'news' | 'images' }): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('web-search', {
      body: { 
        query, 
        location,
        num_results: options?.num_results || 20,
        search_type: options?.search_type || 'google',
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};
