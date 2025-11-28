import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export interface PostFrontMatter {
  title: string;
  slug: string;
  date: string;
  category: string;
  language: string;
  excerpt: string;
  author?: string;
  coverImage?: string;
  keywords?: string[];
}

export interface Post {
  frontMatter: PostFrontMatter;
  content: string;
  htmlContent: string;
  slug: string;
}

async function processMarkdown(content: string): Promise<string> {
  const processedContent = await remark().use(remarkHtml).process(content);
  return processedContent.toString();
}

export async function getAllPosts(): Promise<Post[]> {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = await Promise.all(
    fileNames
      .filter((name) => name.endsWith('.mdx'))
      .map(async (fileName) => {
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);
        const htmlContent = await processMarkdown(content);

        return {
          frontMatter: data as PostFrontMatter,
          content,
          htmlContent,
          slug: data.slug || fileName.replace(/\.mdx$/, ''),
        };
      })
  );

  // Sort posts by date (newest first)
  return allPostsData.sort((a, b) => {
    if (a.frontMatter.date < b.frontMatter.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const fileNames = fs.readdirSync(postsDirectory);
    const fileName = fileNames.find((name) => {
      if (!name.endsWith('.mdx')) return false;
      const fullPath = path.join(postsDirectory, name);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      return data.slug === slug || name.replace(/\.mdx$/, '') === slug;
    });

    if (!fileName) {
      return null;
    }

    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    const htmlContent = await processMarkdown(content);

    return {
      frontMatter: data as PostFrontMatter,
      content,
      htmlContent,
      slug: data.slug || slug,
    };
  } catch (error) {
    return null;
  }
}

export async function getLatestPosts(limit: number = 3): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.slice(0, limit);
}

