// FarmLink - Google Gemini LLM Client with Function Calling ReAct Loop
// Compatible with gemini-2.5-flash, gemini-3.6-flash, and standard REST API
import * as tools from './agentTools.js';
import { AGENT_TOOLS_SPECS } from './agentTools.js';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function testGeminiConnection(apiKey, model = 'gemini-2.5-flash') {
  if (!apiKey || !apiKey.trim()) throw new Error('Gemini API key is required.');
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey.trim()}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Hello, respond with: FarmLink AI Connected.' }] }]
    })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `HTTP ${res.status}: Failed to connect to Gemini API`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { success: true, text };
}

// Convert tool specs into Gemini Function Declarations format
function getGeminiToolsDeclaration() {
  return [
    {
      function_declarations: AGENT_TOOLS_SPECS.map(spec => ({
        name: spec.name,
        description: spec.description,
        parameters: {
          type: 'OBJECT',
          properties: Object.entries(spec.parameters.properties).reduce((acc, [key, val]) => {
            acc[key] = {
              type: val.type.toUpperCase(),
              description: val.description
            };
            return acc;
          }, {}),
          required: spec.parameters.required || []
        }
      }))
    }
  ];
}

// Execute local tool handler based on Gemini function call
export function executeToolByName(name, args, runtimeContext = {}) {
  const handler = tools[name];
  if (typeof handler !== 'function') {
    return { error: `Tool ${name} not found in FarmLink registry` };
  }
  try {
    return handler({ ...args, lots: runtimeContext.lots || [] });
  } catch (err) {
    return { error: `Execution error in ${name}: ${err.message}` };
  }
}

// Master Gemini Function Calling Loop
export async function runGeminiAgent({
  apiKey,
  model = 'gemini-2.5-flash',
  goal,
  userRole = 'farmer',
  language = 'en',
  runtimeContext = {},
  onStep = () => {}
}) {
  if (!apiKey) throw new Error('Gemini API key is not configured.');

  const systemInstruction = {
    parts: [
      {
        text: `You are the FarmLink Autonomous Agricultural Agent (SIH PS 26033).
Your purpose is to empower Indian farmers, disintermediate agricultural cartels, ensure MSP enforcement, unlock 50% e-NWR pledge advances, and optimize rural-to-city food supply chains.

Current User Role: ${userRole.toUpperCase()}
Selected Communication Language: ${language}
Available Farm Hubs: Jaitpura, Phulera, Jaipur North, Sanganer, Kota, Bikaner.

Guidelines:
1. ALWAYS break down the user's agricultural objective into discrete reasoned steps.
2. Call appropriate tools (e.g. tool_get_mandi_msp, tool_forecast_price_trend, tool_calculate_enwr_pledge, tool_evaluate_hold_vs_sell, tool_match_farmer_clusters, tool_plan_logistics_route) to gather real verified platform data.
3. If mandi price is below MSP, proactively protect the farmer from distress selling by recommending WDRA storage + 50% e-NWR pledge financing.
4. If the user asks in Hindi or other Indian languages, provide your final response in that language while keeping numeric prices and facts exact.
5. In your final response, summarize the strategic findings with clear numbers and suggest specific 1-click execution actions (e.g. List produce, Apply for e-NWR Advance, Dispatch cluster vehicle, Reserve lot).`
      }
    ]
  };

  const geminiTools = getGeminiToolsDeclaration();
  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey.trim()}`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: goal }]
    }
  ];

  let iterations = 0;
  const maxIterations = 5;

  onStep({
    type: 'thought',
    content: `Analyzing agricultural goal: "${goal}" for user role: ${userRole.toUpperCase()}. Determining tool execution plan...`
  });

  while (iterations < maxIterations) {
    iterations++;

    const payload = {
      system_instruction: systemInstruction,
      contents,
      tools: geminiTools
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Gemini API error (HTTP ${res.status})`);
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const candidateContent = candidate?.content;

    if (!candidateContent) {
      throw new Error('Gemini returned an empty response.');
    }

    // Append model output to conversation contents
    contents.push(candidateContent);

    // Check if Gemini invoked function calls
    const functionCalls = candidateContent.parts?.filter(p => p.functionCall) || [];

    if (functionCalls.length > 0) {
      const responseParts = [];

      for (const part of functionCalls) {
        const { name, args } = part.functionCall;

        onStep({
          type: 'action',
          tool: name,
          input: args,
          content: `Invoking tool: ${name} with arguments: ${JSON.stringify(args)}`
        });

        // Execute tool locally
        const result = executeToolByName(name, args, runtimeContext);

        onStep({
          type: 'observation',
          tool: name,
          output: result,
          content: `Observation from ${name}: ${result.summary || JSON.stringify(result)}`
        });

        responseParts.push({
          functionResponse: {
            name,
            response: { output: result }
          }
        });
      }

      // Feed tool responses back to Gemini
      contents.push({
        role: 'user',
        parts: responseParts
      });

      // Continue loop for synthesis
      continue;
    }

    // No function calls: Gemini provided final answer
    const finalText = candidateContent.parts
      ?.filter(p => p.text)
      ?.map(p => p.text)
      ?.join('\n') || '';

    return {
      success: true,
      text: finalText,
      contents
    };
  }

  throw new Error('Maximum tool execution iterations exceeded without conclusion.');
}
