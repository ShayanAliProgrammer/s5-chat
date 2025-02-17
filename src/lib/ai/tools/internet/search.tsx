import "server-only";

import { tool } from "ai";
import "server-only";
import { z } from "zod";

import { JSDOM } from "jsdom";
import TurndownService from "turndown";

export const fetchTool = tool({
  description:
    "Extract the main content from a given webpage URL and return it in markdown format.",
  parameters: z.object({
    url: z
      .string()
      .describe(
        "A fully-qualified webpage URL (e.g., 'https://example.com') to scrape the essential content from.",
      ),
  }),
  execute: async ({ url }) => {
    // Fetch the full HTML from the provided URL.
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch URL: ${url} (status: ${response.status})`,
      );
    }
    const html = await response.text();

    // Create a DOM from the HTML.
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Try to extract the main content.
    let contentElement = document.querySelector("main");
    if (!contentElement) {
      // If no <main>, search for the largest <article> by text content length.
      const articles = document.querySelectorAll("article");
      let largestArticle = null;
      let maxLength = 0;
      articles.forEach((article) => {
        const text = article.textContent || "";
        if (text.length > maxLength) {
          largestArticle = article;
          maxLength = text.length;
        }
      });
      contentElement = largestArticle || document.body;
    }

    // Remove unwanted elements such as script, style, and noscript.
    contentElement
      .querySelectorAll("script, style, noscript")
      .forEach((el) => el.remove());

    // Optionally, further refine the content here if needed (e.g. remove navigation or ads).

    // Convert the cleaned HTML content to Markdown.
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(contentElement.innerHTML);
    return markdown;
  },
});

export const multiFetchTool = tool({
  description:
    "Fetch content from multiple webpage URLs concurrently and return their markdown content.",
  parameters: z.object({
    urls: z
      .array(
        z
          .string()
          .describe(
            "A fully-qualified webpage URL (e.g., 'https://example.com').",
          ),
      )
      .describe("An array of URLs to scrape content from."),
  }),
  execute: async ({ urls }) => {
    if (urls.length > 5) {
      return "I can only process 5 URLs at a time. Please split your list into batches of 5 and call this tool for each batch.";
    }

    async function fetchUrl(url: string): Promise<string> {
      const response = await fetch(url);
      return await response.text();
    }

    const concurrencyLimit = 5;
    let index = 0;
    const results: Record<string, string> = {};

    async function worker() {
      while (index < urls.length) {
        const currentIndex = index++;
        const url = urls[currentIndex] as string;
        try {
          results[url] = await fetchUrl(url);
        } catch (error) {
          results[url] = `Error fetching content: ${error}`;
        }
      }
    }

    const workers = [];
    const parallelWorkers = Math.min(concurrencyLimit, urls.length);
    for (let i = 0; i < parallelWorkers; i++) {
      workers.push(worker());
    }
    await Promise.all(workers);
    return results;
  },
});
