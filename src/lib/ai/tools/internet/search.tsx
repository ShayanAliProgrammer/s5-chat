import { tool } from "ai";
import { JSDOM } from "jsdom";
import "server-only";
import TurndownService from "turndown";
import { z } from "zod";

export const fetchTool = tool({
  description: `
    This tool retrieves the primary textual content from a single webpage URL and converts it into Markdown format for easy reading and processing. It is designed to extract meaningful content (e.g., articles, blog posts, or main sections) while ignoring irrelevant elements like scripts, styles, advertisements, or navigation menus. The tool prioritizes the <main> HTML element if present; otherwise, it identifies the largest <article> by text length or falls back to the <body> element as a last resort. The output is a clean Markdown string suitable for display or further analysis.
    
    Use this tool when you need concise, formatted content from a specific webpage, such as summarizing an article or extracting documentation. It is ideal for single-page scraping tasks but does not handle multiple URLs (see multiFetchTool for that purpose).
  `,
  parameters: z.object({
    url: z.string().url() // Ensures the input is a valid URL
      .describe(`
        A fully-qualified webpage URL (e.g., "https://example.com/blog-post") from which to extract the main content. The URL must include the protocol (http:// or https://), a valid domain, and optionally a path. Examples of valid URLs:
        - "https://www.wikipedia.org/wiki/AI"
        - "http://example.com"
        - "https://blog.example.com/2023/10/post-title"
        
        Invalid URLs (e.g., "example.com", "/path/only", or malformed strings) will result in an error.
      `),
  }),
  execute: async ({ url }) => {
    try {
      // Fetch the webpage content
      const response = await fetch(url, {
        headers: {
          "User-Agent": "fetchTool/1.0 (Web Content Extractor)", // Add a user-agent for better server compatibility
        },
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch URL "${url}": HTTP status ${response.status} (${response.statusText})`,
        );
      }
      const html = await response.text();

      // Parse the HTML into a DOM structure
      const dom = new JSDOM(html);
      const document = dom.window.document;

      // Attempt to locate the main content container
      let contentElement = document.querySelector("main");
      if (!contentElement) {
        // Fallback: Find the largest <article> by text content length
        const articles = document.querySelectorAll("article");
        let largestArticle = null;
        let maxLength = 0;
        articles.forEach((article) => {
          const text = article.textContent?.trim() || "";
          if (text.length > maxLength) {
            largestArticle = article;
            maxLength = text.length;
          }
        });
        contentElement = largestArticle || document.body; // Final fallback to <body>
      }

      // Clean the content by removing unwanted elements
      contentElement
        .querySelectorAll("script, style, noscript, nav, footer, header, aside")
        .forEach((el) => el.remove()); // Enhanced removal of non-content elements

      // Convert the cleaned HTML to Markdown
      const turndownService = new TurndownService({
        headingStyle: "atx", // Use # for headings
        codeBlockStyle: "fenced", // Use ``` for code blocks
      });
      const markdown = turndownService
        .turndown(contentElement.innerHTML)
        .trim();

      // Validate the output
      if (!markdown || markdown.length < 10) {
        throw new Error(
          `Extracted content from "${url}" is too short or empty; the page may lack substantial text.`,
        );
      }

      return markdown;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Unknown error occurred while processing "${url}"`;
      throw new Error(`fetchTool failed: ${errorMessage}`);
    }
  },
});

export const multiFetchTool = tool({
  description: `
    This tool fetches the main textual content from multiple webpage URLs concurrently and returns their cleaned content in Markdown format as a JSON object. It processes up to 5 URLs at a time to balance performance and server load, using parallel requests to optimize speed. For each URL, it attempts to extract the primary content (e.g., from the <main> or largest <article> element), removes irrelevant elements (scripts, styles, etc.), and converts the result to Markdown. The output is a key-value object where each key is a URL and the value is either the Markdown content or an error message if the fetch fails.

    Use this tool when you need to scrape content from multiple pages simultaneously, such as comparing articles or gathering data from a list of sources. If you have more than 5 URLs, split them into batches of 5 or fewer and call this tool multiple times to process all URLs without exceeding the limit.
  `,
  parameters: z.object({
    urls: z
      .array(
        z.string().url() // Ensures each entry is a valid URL
          .describe(`
            A fully-qualified webpage URL (e.g., "https://example.com/article") to extract content from. Must include the protocol (http:// or https://) and a valid domain. Examples:
            - "https://news.example.com/story1"
            - "https://blog.example.com/post2"
            Invalid entries (e.g., "example.com" or "not-a-url") will cause errors for that specific URL.
          `),
      )
      .max(5, { message: "Maximum of 5 URLs allowed per execution." }) // Enforce limit at schema level
      .describe(`
        An array of up to 5 webpage URLs to scrape concurrently. The tool processes these in parallel for efficiency but limits the count to 5 to prevent overloading servers or exceeding resource constraints. If you provide more than 5 URLs, the tool will return an error message instructing you to split the list into smaller batches.
      `),
  }),
  execute: async ({ urls }) => {
    // Schema validation already ensures urls.length <= 5, but we keep this for clarity
    if (urls.length > 5) {
      return {
        error:
          "Maximum of 5 URLs allowed. Split your list into batches of 5 and retry.",
      };
    }

    const results: Record<string, string> = {};

    // Helper function to fetch and process a single URL
    const processUrl = async (url: string): Promise<string> => {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "multiFetchTool/1.0 (Web Content Extractor)",
          },
        });
        if (!response.ok) {
          throw new Error(
            `HTTP status ${response.status} (${response.statusText})`,
          );
        }
        const html = await response.text();

        const dom = new JSDOM(html);
        const document = dom.window.document;

        let contentElement = document.querySelector("main");
        if (!contentElement) {
          const articles = document.querySelectorAll("article");
          let largestArticle = null;
          let maxLength = 0;
          articles.forEach((article) => {
            const text = article.textContent?.trim() || "";
            if (text.length > maxLength) {
              largestArticle = article;
              maxLength = text.length;
            }
          });
          contentElement = largestArticle || document.body;
        }

        contentElement
          .querySelectorAll(
            "script, style, noscript, nav, footer, header, aside",
          )
          .forEach((el) => el.remove());

        const turndownService = new TurndownService({
          headingStyle: "atx",
          codeBlockStyle: "fenced",
        });
        const markdown = turndownService
          .turndown(contentElement.innerHTML)
          .trim();

        if (!markdown || markdown.length < 10) {
          throw new Error("Content too short or empty");
        }
        return markdown;
      } catch (error) {
        return `Error processing "${url}": ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
      }
    };

    // Process all URLs concurrently
    const fetchPromises = urls.map(async (url) => {
      const result = await processUrl(url);
      results[url] = result;
    });

    await Promise.all(fetchPromises);
    return results;
  },
});
