import ReactMarkdown from "react-markdown";

/**
 * Shared markdown renderer used across pages (trip detail, assistant, etc.)
 * Renders markdown with a consistent dark-theme style.
 */
export default function MarkdownContent({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => (
          <h1 className="text-xl font-bold text-slate-100 mt-4 mb-2 first:mt-0" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="text-lg font-bold text-slate-100 mt-3 mb-1.5" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="text-base font-bold text-slate-100 mt-3 mb-1" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="text-slate-300 text-sm leading-relaxed mb-3 last:mb-0" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul
            className="list-disc list-outside text-slate-300 text-sm leading-relaxed mb-3 space-y-1.5 pl-5"
            {...props}
          />
        ),
        ol: ({ node, ...props }) => (
          <ol
            className="list-decimal list-outside text-slate-300 text-sm leading-relaxed mb-3 space-y-1.5 pl-5"
            {...props}
          />
        ),
        li: ({ node, ...props }) => (
          <li className="text-slate-300 text-sm leading-relaxed pl-1" {...props} />
        ),
        strong: ({ node, ...props }) => (
          <strong className="font-semibold text-blue-300" {...props} />
        ),
        em: ({ node, ...props }) => (
          <em className="italic text-purple-300" {...props} />
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code: ({ node, inline, className, ...props }: any) =>
          inline ? (
            <code
              className="bg-slate-800/50 px-1.5 py-0.5 rounded text-cyan-300 text-xs font-mono"
              {...props}
            />
          ) : (
            <code
              className="block bg-slate-800/70 border border-slate-700/50 px-4 py-3 rounded-lg text-cyan-300 text-xs font-mono overflow-x-auto mb-3 whitespace-pre"
              {...props}
            />
          ),
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-blue-400/50 pl-4 text-slate-400 italic mb-3"
            {...props}
          />
        ),
        hr: () => <hr className="my-4 border-slate-700/30" />,
        a: ({ node, ...props }) => (
          <a
            className="text-blue-400 hover:text-blue-300 underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
