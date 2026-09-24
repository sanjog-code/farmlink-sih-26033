import React from 'react';
import './formattedAiMessage.css';
import { sanitizeAiText, parseBlocks } from './aiTextCleaner.js';

export { sanitizeAiText, parseBlocks };

/**
 * Pure inline formatting parser for bold (**text**), italics (*text*), currency (₹...), and percentages (...%).
 */
function renderInlineFormatting(text) {
  if (!text) return null;

  // Clean weird symbols like ~#, ~, # before parsing inline elements
  const cleaned = sanitizeAiText(text);
  if (!cleaned) return null;

  // Split on **bold** syntax first
  const parts = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(cleaned)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: cleaned.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'bold', content: match[1] });
    lastIndex = boldRegex.lastIndex;
  }
  if (lastIndex < cleaned.length) {
    parts.push({ type: 'text', content: cleaned.substring(lastIndex) });
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

export default function FormattedAiMessage({ text = '', onOptionClick = null, className = '' }) {
  if (!text) return null;

  const blocks = parseBlocks(text);

  return (
    <div className={`ai-formatted-container ${className}`}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'heading') {
          return (
            <h4 key={bIdx} className="ai-formatted-heading">
              {renderInlineFormatting(block.content)}
            </h4>
          );
        }

        if (block.type === 'divider') {
          return <hr key={bIdx} className="ai-formatted-divider" />;
        }

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
