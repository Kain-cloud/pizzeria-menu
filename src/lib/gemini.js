const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

async function callGemini(contents) {
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Translate a menu item's name and description into target languages.
 * Returns { it: { name, description }, es: { name, description } }
 */
export async function translateMenuItem(name, description, sourceLang = 'en') {
  const prompt = `Translate this restaurant menu item accurately. Keep it natural and appetizing.
Return ONLY valid JSON, no markdown fences.

Source (${sourceLang}):
Name: "${name}"
Description: "${description}"

Return this exact JSON structure:
{"it":{"name":"...","description":"..."},"es":{"name":"...","description":"..."}}`;

  const text = await callGemini([{ role: 'user', parts: [{ text: prompt }] }]);

  try {
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse translation response');
  }
}

/**
 * Chat with Gemini about the menu.
 * @param {Array} messages - [{ role: 'user'|'model', text }]
 * @param {Object} menuContext - { items, categories }
 */
export async function chatWithMenu(messages, menuContext) {
  const menuSummary = menuContext.items.map(item => {
    const prices = Object.entries(item.prices || {})
      .map(([k, v]) => k === 'default' ? `${v}L` : `${k.toUpperCase()}: ${v}L`)
      .join(', ');
    const name = item.translations?.en?.name || item.slug.replace(/_/g, ' ');
    const desc = item.translations?.en?.description || '';
    const allergens = item.allergens?.length ? `Allergens: ${item.allergens.join(', ')}` : '';
    const tags = item.tags?.length ? `Tags: ${item.tags.join(', ')}` : '';
    return `- ${name}: ${desc} | ${prices} ${allergens} ${tags}`.trim();
  }).join('\n');

  const systemPrompt = `You are the friendly digital assistant for Pizzeria Ardi in Durrës, Albania. Help customers explore the menu, answer questions about dishes, allergens, and give recommendations. Be warm, concise (2-3 sentences max), and helpful. Respond in the same language the customer uses. If asked about things unrelated to the restaurant or menu, politely redirect.

Current menu:
${menuSummary}`;

  const contents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Understood! I\'m ready to help customers with the Pizzeria Ardi menu.' }] },
    ...messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    })),
  ];

  return await callGemini(contents);
}

export function isGeminiConfigured() {
  return !!GEMINI_API_KEY;
}
