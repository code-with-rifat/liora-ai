import React from 'react';

function inlineFormat(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_|\[([^\]]+)\]\(([^)]+)\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith('`')) {
      nodes.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-zinc-100 text-blue-600 font-mono text-[13px] border border-zinc-200/80 font-medium"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') || token.startsWith('__')) {
      nodes.push(
        <strong key={key++} className="font-bold text-zinc-950">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('[')) {
      nodes.push(
        <a
          key={key++}
          href={match[3]}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-blue-400 hover:decoration-blue-600 transition-colors font-medium"
        >
          {match[2]}
        </a>
      );
    } else {
      nodes.push(
        <em key={key++} className="italic text-zinc-700">
          {token.slice(1, -1)}
        </em>
      );
    }
    last = match.index + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function parseMarkdownTable(lines: string[]): React.ReactNode {
  if (lines.length < 2) return null;

  const headerRow = lines[0]
    .split('|')
    .map((c) => c.trim())
    .filter((c, i, a) => (i === 0 && c === '' ? false : i === a.length - 1 && c === '' ? false : true));

  // Check if line 1 is separator |---|---|
  const isSeparator = /^\|?[\s:-|-]+\|?$/.test(lines[1]);
  const dataLines = isSeparator ? lines.slice(2) : lines.slice(1);

  const rows = dataLines.map((line) =>
    line
      .split('|')
      .map((c) => c.trim())
      .filter((c, i, a) => (i === 0 && c === '' ? false : i === a.length - 1 && c === '' ? false : true))
  );

  return (
    <div className="my-4 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse text-xs md:text-sm">
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-900 font-bold">
            {headerRow.map((h, idx) => (
              <th key={idx} className="px-4 py-3 font-bold text-zinc-900">
                {inlineFormat(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 text-zinc-800">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-zinc-50/80 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-3 leading-relaxed text-zinc-800 font-normal">
                  {inlineFormat(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MarkdownBody({ text }: { text: string }) {
  if (!text) return null;
  const blocks = text.split(/```/);

  return (
    <div className="space-y-3.5 text-zinc-800 text-[15px] leading-7">
      {blocks.map((block, i) => {
        // Code Block
        if (i % 2 === 1) {
          const newline = block.indexOf('\n');
          const lang = newline === -1 ? '' : block.slice(0, newline).trim();
          const code = newline === -1 ? block : block.slice(newline + 1).replace(/\n$/, '');
          return (
            <div key={i} className="my-3 overflow-hidden rounded-2xl border border-zinc-800 bg-[#0f172a] shadow-md text-slate-100">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-cyan-400">
                <span className="uppercase tracking-wider font-semibold">{lang || 'CODE'}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="hover:text-white text-slate-400 text-[11px] transition-colors"
                >
                  Copy
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed text-slate-100">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        const lines = block.split('\n');
        const elements: React.ReactNode[] = [];
        let listItems: string[] = [];
        let isOrderedList = false;
        let tableLines: string[] = [];
        let para: string[] = [];

        const flushTable = () => {
          if (!tableLines.length) return;
          const tableNode = parseMarkdownTable(tableLines);
          if (tableNode) {
            elements.push(<React.Fragment key={`table-${elements.length}`}>{tableNode}</React.Fragment>);
          } else {
            tableLines.forEach((tl) => para.push(tl));
          }
          tableLines = [];
        };

        const flushList = () => {
          if (!listItems.length) return;
          if (isOrderedList) {
            elements.push(
              <ol key={`ol-${elements.length}`} className="list-decimal list-outside pl-6 space-y-1.5 text-zinc-800">
                {listItems.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {inlineFormat(item)}
                  </li>
                ))}
              </ol>
            );
          } else {
            elements.push(
              <ul key={`ul-${elements.length}`} className="list-disc list-outside pl-6 space-y-1.5 text-zinc-800">
                {listItems.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {inlineFormat(item)}
                  </li>
                ))}
              </ul>
            );
          }
          listItems = [];
          isOrderedList = false;
        };

        const flushPara = () => {
          if (!para.length) return;
          elements.push(
            <p key={`p-${elements.length}`} className="leading-7 text-zinc-800 font-normal">
              {inlineFormat(para.join(' '))}
            </p>
          );
          para = [];
        };

        for (let idx = 0; idx < lines.length; idx++) {
          const rawLine = lines[idx];
          const trimmed = rawLine.trim();

          // Empty line
          if (!trimmed) {
            flushTable();
            flushList();
            flushPara();
            continue;
          }

          // Table row detection (| Cell 1 | Cell 2 |)
          if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
            flushList();
            flushPara();
            tableLines.push(trimmed);
            continue;
          } else if (tableLines.length > 0) {
            flushTable();
          }

          // Horizontal rule
          if (/^(\*\*\*|---|___)$/.test(trimmed)) {
            flushList();
            flushPara();
            elements.push(<hr key={`hr-${idx}`} className="my-4 border-zinc-200" />);
            continue;
          }

          // Headings (#, ##, ###)
          if (/^#{1,4}\s+/.test(trimmed)) {
            flushList();
            flushPara();
            const level = trimmed.match(/^#+/)?.[0].length || 1;
            const heading = trimmed.replace(/^#{1,4}\s+/, '');
            const cls =
              level === 1
                ? 'text-xl font-bold text-zinc-950 pt-2 border-b border-zinc-200 pb-1.5'
                : level === 2
                ? 'text-lg font-bold text-zinc-900 pt-2 pb-1'
                : 'text-base font-bold text-zinc-900 pt-1.5';
            elements.push(
              <div key={`h-${idx}`} className={cls}>
                {inlineFormat(heading)}
              </div>
            );
            continue;
          }

          // Numbered / Ordered list (1. , ২. , etc.)
          const orderedMatch = trimmed.match(/^(\d+|[১-৯]+)\.\s+(.*)/);
          if (orderedMatch) {
            flushPara();
            if (!isOrderedList && listItems.length > 0) flushList();
            isOrderedList = true;
            listItems.push(orderedMatch[2]);
            continue;
          }

          // Bullet list (- , * , o , • )
          const bulletMatch = trimmed.match(/^[-*•o]\s+(.*)/);
          if (bulletMatch) {
            flushPara();
            if (isOrderedList && listItems.length > 0) flushList();
            isOrderedList = false;
            listItems.push(bulletMatch[1]);
            continue;
          }

          // Regular paragraph text
          flushList();
          para.push(trimmed);
        }

        flushTable();
        flushList();
        flushPara();

        return <div key={i} className="space-y-2.5">{elements}</div>;
      })}
    </div>
  );
}
