/**
 * FarmLink AI Text Cleaner & Block Parser
 * Eradicates raw markdown artifacts (~#, #, ---, ~) and parses structured blocks
 * for high readability across Indian farmer interfaces.
 */

/**
 * Cleans weird symbols (~#, #, ~, ---, stray backticks) from text.
 */
export function sanitizeAiText(text) {
  if (!text) return '';
  return text
    // Remove weird combos like ~#, #~, ~-, -~, ~*
    .replace(/~#+|#+~|~[-*]+|[-*]+~/g, '')
    // Remove tildes before currency, numbers, or words (e.g. ~₹ -> ₹, ~500 -> 500, ~ 20% -> 20%)
    .replace(/~+\s*/g, '')
    // Convert #1, #2 to No. 1, No. 2
    .replace(/#(\d+)/g, 'No. $1')
    // Remove strikethroughs ~~text~~ -> text
    .replace(/~~(.+?)~~/g, '$1')
    // Remove markdown code fences and stray backticks
    .replace(/```[a-z]*\n?/gi, '')
    .replace(/`/g, '')
    // Strip stray hashes
    .replace(/#+/g, '')
    .trim();
}

/**
 * Parses raw markdown AI outputs into structured blocks:
 * - Numbered Option Cards
 * - Bullet Points
 * - Clean Headings (no ### symbols)
 * - Visual Dividers (no raw --- text)
 * - Paragraphs with clean typography
 */
export function parseBlocks(rawText) {
  if (!rawText) return [];

  // Remove code blocks and split lines
  const normalized = rawText
    .replace(/```[a-z]*\r?\n/gi, '')
    .replace(/```/g, '');

  const lines = normalized.split(/\r?\n/);
  const blocks = [];
  let currentList = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      continue;
    }

    // 1. Horizontal divider: "---", "***", "___", "===", "~~~"
    if (/^\s*[-*_=\~]{3,}\s*$/.test(rawLine)) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      blocks.push({ type: 'divider' });
      continue;
    }

    // 2. Skip table divider lines like |---|---| or |:---|---:|
    if (/^\|[-:\s|]{3,}\|$/.test(rawLine)) {
      continue;
    }

    // Clean leading weird prefixes if present (e.g. "~# ", "#~ ", "### ")
    let line = rawLine;

    // 3. Numbered item check (handles "1. ", "1) ", "### 1. ", "# 1. ", "~# 1. ")
    const numCleaned = line.replace(/^(?:~#+|#+~|#+|\~+)\s*/, '');
    const numMatch = numCleaned.match(/^(\d+)[\.\)]\s*(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const rest = sanitizeAiText(numMatch[2]);

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
        title: title ? title.trim() : '',
        desc: desc ? desc.trim() : '',
        raw: rest
      });
      continue;
    }

    // 4. Bullet point: "• text", "- text", "* text", or with leading hashes
    const bulletCleaned = line.replace(/^(?:~#+|#+~|#+|\~+)\s*/, '');
    const bulletMatch = bulletCleaned.match(/^[\*\•\-\+]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'bullet_list') {
        if (currentList) blocks.push(currentList);
        currentList = { type: 'bullet_list', items: [] };
      }
      const itemContent = sanitizeAiText(bulletMatch[1]);
      if (itemContent) {
        currentList.items.push(itemContent);
      }
      continue;
    }

    // 5. Heading: "# Title", "## Title", "### Title", "~# Title"
    const headingMatch = line.match(/^(?:#{1,6}|~#+|#+~)\s+(.*)$/);
    if (headingMatch) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      const headingContent = sanitizeAiText(headingMatch[1]);
      if (headingContent) {
        blocks.push({ type: 'heading', content: headingContent });
      }
      continue;
    }

    // Normal paragraph line
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
    const cleanPara = sanitizeAiText(line);
    if (cleanPara) {
      blocks.push({ type: 'paragraph', content: cleanPara });
    }
  }

  if (currentList) {
    blocks.push(currentList);
  }

  return blocks;
}
