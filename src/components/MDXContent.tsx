interface MDXContentProps {
  htmlContent: string;
}

export default function MDXContent({ htmlContent }: MDXContentProps) {
  return (
    <div 
      className="prose prose-lg max-w-none prose-headings:text-grey-900 prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-grey-700 prose-p:leading-relaxed prose-a:text-grey-900 prose-a:underline prose-a:transition-colors hover:prose-a:text-grey-700 prose-strong:text-grey-900 prose-strong:font-semibold prose-code:text-grey-800 prose-code:bg-grey-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-grey-100 prose-pre:border prose-pre:border-grey-200 prose-pre:rounded-lg prose-ul:text-grey-700 prose-ol:text-grey-700 prose-li:text-grey-700 prose-blockquote:border-l-grey-300 prose-blockquote:text-grey-600"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

