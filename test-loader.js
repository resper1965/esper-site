const { docs, meta } = require('./.source/index.ts');
const { loader } = require('fumadocs-core/source');
const { createMDXSource } = require('fumadocs-mdx');

console.log('docs:', typeof docs, Array.isArray(docs));
console.log('meta:', typeof meta, Array.isArray(meta));

try {
  const source = createMDXSource(docs, meta);
  console.log('source:', typeof source, Array.isArray(source));
  
  const blogSource = loader({
    baseUrl: "/blog",
    source: source,
  });
  
  const pages = blogSource.getPages();
  console.log('pages:', typeof pages, Array.isArray(pages));
} catch (e) {
  console.error('Error:', e.message);
}
