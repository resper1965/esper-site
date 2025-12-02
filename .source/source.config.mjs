// source.config.ts
import {
  defineConfig,
  defineDocs,
  frontmatterSchema
} from "fumadocs-mdx/config";
import { z } from "zod";
var source_config_default = defineConfig({
  mdxOptions: {
    providerImportSource: "@/mdx-components"
  }
});
var { docs, meta } = defineDocs({
  dir: "src/content/posts",
  docs: {
    schema: frontmatterSchema.extend({
      date: z.string(),
      tags: z.array(z.string()).optional(),
      featured: z.boolean().optional().default(false),
      readTime: z.string().optional(),
      author: z.string().optional(),
      thumbnail: z.string().optional(),
      language: z.enum(["pt-BR", "pt-br", "en"]).optional().default("pt-BR").transform((val) => val === "pt-br" ? "pt-BR" : val)
    })
  }
});
export {
  source_config_default as default,
  docs,
  meta
};
