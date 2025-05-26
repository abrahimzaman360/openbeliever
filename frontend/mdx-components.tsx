import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => (
      <article className="prose prose-lg prose-gray max-w-none prose-headings:font-bold prose-a:text-blue-600">
        {children}
      </article>
    ),
    ...components,
  };
}
