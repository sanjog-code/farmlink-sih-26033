const sample = `राम-राम भाई! सब बढ़िया अर एकदम राजी-खुशी।

मैं हूँ आपका **FarmLink AI डिजिटल कृषि साथी**।

बताइए आज क्या मदद करूँ?
1. **मंडी भाव और MSP जांचें**: अपनी फसल का आज का मंडी रेट और सरकारी MSP जानें।
2. **e-NWR लोन / गोदाम भंडारण**: फसल तुरंत बेचने के बजाय WDRA गोदाम में रखकर 50% तक तुरंत लोन पायें।
3. **फसल बेचने का सही समय (Hold vs Sell)**: जाने फसल रोके रखें या अभी बेचें।
4. **सस्ता ट्रांसपोर्ट और क्लस्टर बुकिंग**: गाँव से शहर/मंडी तक फसल भेजने का सबसे सस्ता साधन।

आप अपनी **फसल का नाम** और **गाँव/मंडी** बताइए, फिर देखिए कमाल!`;

function parseInlineFormatting(text) {
  // Split on **...** for bolding
  const parts = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'bold', content: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }
  return parts.length ? parts : [{ type: 'text', content: text }];
}

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

    // Numbered list match: "1. **Title**: Description" or "1. Title: Description"
    const numMatch = line.match(/^(\d+)[\.\)]\s*(.*)$/);
    if (numMatch) {
      const num = numMatch[1];
      const rest = numMatch[2];
      
      // Check title vs desc
      let title = '';
      let desc = rest;
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

    // Bullet list match: "• text" or "- text" or "* text"
    const bulletMatch = line.match(/^[\*\•\-]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'bullet_list') {
        if (currentList) blocks.push(currentList);
        currentList = { type: 'bullet_list', items: [] };
      }
      currentList.items.push(bulletMatch[1].trim());
      continue;
    }

    // Regular line / paragraph
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

const blocks = parseBlocks(sample);
console.log('Parsed Blocks:');
console.log(JSON.stringify(blocks, null, 2));

const inlineTest = parseInlineFormatting('मैं हूँ आपका **FarmLink AI डिजिटल कृषि साथी**।');
console.log('\nInline test:');
console.log(JSON.stringify(inlineTest, null, 2));
