import React from 'react';
import './formattedAiMessage.css';

/**
 * Pure inline formatting parser for bold (**text**), italics (*text*), currency (₹...), and percentages (...%).
 */
function renderInlineFormatting(text) {
  if (!text) return null;

  // Split on **bold** syntax first
  const parts = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'bold', content: match[1] });
    lastIndex = boldRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return parts.map((part, idx) => {
    if (part.type === 'bold') {
      return (
        <strong key={idx} className="ai-formatted-bold">
          {part.content}
        </strong>
      );
    }

    // Highlight currency amounts (₹...) and percentages (X%)
    const textStr = part.content;
    const statRegex = /(₹[\d,]+(?:\.\d+)?|\b\d+%\b)/g;
    if (statRegex.test(textStr)) {
      const subTokens = textStr.split(statRegex);
      return (
        <span key={idx}>
          {subTokens.map((sub, sIdx) =>
            statRegex.test(sub) ? (
              <span key={sIdx} className="ai-highlight-stat">
                {sub}
              </span>
            ) : (
              sub
            )
          )}
        </span>
      );
    }

    return <span key={idx}>{textStr}</span>;
  });
}

/**
 * Parses raw markdown AI outputs into structured blocks:
 * - Numbered Option Cards
 * - Bullet Points
 * - Paragraphs with clean typography
 */
function parseBlocks(rawText) {
  if (!rawText) return [];
  const lines = rawText.split(/\r?\n/);
  const blocks = [];
  let currentList = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      continue;
    }

    // Numbered item: "1. **Title**: Desc" or "1. Title: Desc" or "1) Title"
    const numMatch = line.match(/^(\d+)[\.\)]\s*(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const rest = numMatch[2];

      let title = '';
      let desc = rest;

      // Check if there is a colon separator
      const colonMatch = rest.match(/^(?:\*\*(.+?)\*\*|([^:]+)):\s*(.*)$/);
      if (colonMatch) {
        title = colonMatch[1] || colonMatch[2];
        desc = colonMatch[3];
      } else {
        const boldTitleMatch = rest.match(/^\*\*(.+?)\*\*\s*(.*)$/);
        if (boldTitleMatch) {
          title = boldTitleMatch[1];
          desc = boldTitleMatch[2];
        }
      }

      if (!currentList || currentList.type !== 'numbered_list') {
        if (currentList) blocks.push(currentList);
        currentList = { type: 'numbered_list', items: [] };
      }

      currentList.items.push({
        num,
        title: title.trim(),
        desc: desc.trim(),
        raw: rest
      });
      continue;
    }

    // Bullet point: "• text" or "- text" or "* text"
    const bulletMatch = line.match(/^[\*\•\-]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'bullet_list') {
        if (currentList) blocks.push(currentList);
        currentList = { type: 'bullet_list', items: [] };
      }
      currentList.items.push(bulletMatch[1].trim());
      continue;
    }

    // Normal paragraph line
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
    blocks.push({ type: 'paragraph', content: line });
  }

  if (currentList) {
    blocks.push(currentList);
  }

  return blocks;
}

export default function FormattedAiMessage({ text = '', onOptionClick = null, className = '' }) {
  if (!text) return null;

  const blocks = parseBlocks(text);

  return (
    <div className={`ai-formatted-container ${className}`}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'paragraph') {
          return (
            <p key={bIdx} className="ai-formatted-paragraph">
              {renderInlineFormatting(block.content)}
            </p>
          );
        }

        if (block.type === 'numbered_list') {
          return (
            <div key={bIdx} className="ai-options-grid">
              {block.items.map((item, iIdx) => (
                <div
                  key={iIdx}
                  className={`ai-option-card ${onOptionClick ? 'is-clickable' : ''}`}
                  onClick={() => onOptionClick && onOptionClick(item.title || item.raw)}
                  role={onOptionClick ? 'button' : undefined}
                  tabIndex={onOptionClick ? 0 : undefined}
                >
                  <div className="ai-option-num-badge">{item.num}</div>
                  <div className="ai-option-text-wrap">
                    {item.title && (
                      <div className="ai-option-title">
                        {renderInlineFormatting(item.title)}
                      </div>
                    )}
                    {item.desc && (
                      <div className="ai-option-desc">
                        {renderInlineFormatting(item.desc)}
                      </div>
                    )}
                    {!item.title && !item.desc && (
                      <div className="ai-option-desc">
                        {renderInlineFormatting(item.raw)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        }

        if (block.type === 'bullet_list') {
          return (
            <ul key={bIdx} className="ai-bullet-list">
              {block.items.map((itemStr, itIdx) => (
                <li key={itIdx} className="ai-bullet-item">
                  {renderInlineFormatting(itemStr)}
                </li>
              ))}
            </ul>
          );
        }

        return null;
      })}
    </div>
  );
}
