'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { codeToHtml } from 'shiki';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { SupportedLanguage } from '../model/types';

interface CodeBlockProps {
  code: string;
  language: SupportedLanguage;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [html, setHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { resolvedTheme } = useTheme();

  const shikiTheme = resolvedTheme === 'dark' ? 'github-dark' : 'github-light';
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    let cancelled = false;

    codeToHtml(code, {
      lang: language,
      theme: shikiTheme,
    }).then((result) => {
      if (!cancelled) setHtml(result);
    });

    return () => {
      cancelled = true;
    };
  }, [code, language, shikiTheme]);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  // Build line-numbered fallback while shiki loads
  const lines = code.split('\n');

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden glass-subtle border border-border',
        className
      )}
    >
      {/* Copy button */}
      <button
        onClick={handleCopy}
        aria-label={copied ? '복사됨' : '코드 복사'}
        className={cn(
          'absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-md px-2 py-1',
          'text-xs font-medium transition-colors',
          'bg-muted hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground hover:text-foreground'
        )}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        <span>{copied ? '복사됨' : '복사'}</span>
      </button>

      {/* Rendered HTML from shiki */}
      {html ? (
        <div
          className="overflow-x-auto text-sm [&>pre]:p-4 [&>pre]:m-0 [&>pre]:bg-transparent! font-mono"
          // shiki generates safe, sanitized HTML
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: addLineNumbers(html, isDark) }}
        />
      ) : (
        /* Fallback with line numbers while shiki loads */
        <pre className="overflow-x-auto p-4 text-sm font-mono text-muted-foreground">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="mr-4 w-6 shrink-0 select-none text-right text-slate-400">
                  {i + 1}
                </span>
                <span>{line}</span>
              </div>
            ))}
          </code>
        </pre>
      )}
    </div>
  );
}

/**
 * Injects line-number spans into shiki's generated <pre><code> block.
 * shiki wraps each line in a <span class="line">...</span> — we prepend
 * a line-number element to each of those spans.
 */
function addLineNumbers(html: string, isDark: boolean): string {
  let lineIndex = 0;
  const lineNumColor = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';
  return html.replace(/<span class="line">/g, () => {
    lineIndex += 1;
    return `<span class="line" style="display:flex"><span style="min-width:2rem;padding-right:1rem;text-align:right;color:${lineNumColor};user-select:none;flex-shrink:0">${lineIndex}</span>`;
  });
}
