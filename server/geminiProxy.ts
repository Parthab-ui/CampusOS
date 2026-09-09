import type { IncomingMessage, ServerResponse } from 'node:http';

interface CopilotRequestBody {
  query: string;
  systemInstruction: string;
}

export async function handleCopilotRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  // Enforce POST method
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  // Collect request body
  let bodyStr = '';
  req.on('data', (chunk) => {
    bodyStr += chunk;
    // Protect against huge payload attacks (>1MB)
    if (bodyStr.length > 1024 * 1024) {
      res.statusCode = 413;
      res.end(JSON.stringify({ error: 'Payload Too Large' }));
      req.destroy();
    }
  });

  req.on('end', async () => {
    try {
      res.setHeader('Content-Type', 'application/json');

      const parsed: CopilotRequestBody = JSON.parse(bodyStr);
      const query = parsed.query?.trim() || '';
      const systemInstruction = parsed.systemInstruction?.trim() || '';

      // Validate & sanitize input
      if (!query) {
        res.statusCode = 400;
        res.end(JSON.stringify({ success: false, error: 'Query parameter is required' }));
        return;
      }

      if (query.length > 1500) {
        res.statusCode = 400;
        res.end(JSON.stringify({ success: false, error: 'Query exceeds maximum allowed length' }));
        return;
      }

      // Check for Gemini API key strictly from server environment
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      const model =
        process.env.GEMINI_MODEL || process.env.VITE_AI_MODEL || 'gemini-2.5-flash';

      // Graceful fallback if no API key is set
      if (!apiKey || apiKey.trim() === '') {
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            success: false,
            fallback: true,
            provider: 'deterministic-fallback',
            error: 'GEMINI_API_KEY is not configured. Using deterministic financial intelligence engine.',
          })
        );
        return;
      }

      // Call Google Gemini API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const geminiPayload = {
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: query }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      };

      try {
        const geminiRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(geminiPayload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!geminiRes.ok) {
          const errBody = await geminiRes.text();
          let parsedErr = `Gemini API returned HTTP ${geminiRes.status}`;
          try {
            const jsonErr = JSON.parse(errBody);
            parsedErr = jsonErr.error?.message || parsedErr;
          } catch {
            // keep default
          }

          // Return graceful fallback on quota, auth, or model errors
          res.statusCode = 200;
          res.end(
            JSON.stringify({
              success: false,
              fallback: true,
              provider: 'deterministic-fallback',
              error: `Gemini API error: ${parsedErr}. Using deterministic engine.`,
            })
          );
          return;
        }

        const data = await geminiRes.json();
        const candidate = data.candidates?.[0];
        const generatedText =
          candidate?.content?.parts?.[0]?.text ||
          'I analyzed your finances based on the recorded ledger facts.';

        res.statusCode = 200;
        res.end(
          JSON.stringify({
            success: true,
            fallback: false,
            provider: 'gemini-flash',
            model,
            text: generatedText,
          })
        );
      } catch (networkErr: any) {
        clearTimeout(timeoutId);
        const isTimeout = networkErr.name === 'AbortError';

        res.statusCode = 200;
        res.end(
          JSON.stringify({
            success: false,
            fallback: true,
            provider: 'deterministic-fallback',
            error: isTimeout
              ? 'Gemini request timed out (10s). Using deterministic engine.'
              : `Gemini request failed (${networkErr.message}). Using deterministic engine.`,
          })
        );
      }
    } catch (err: any) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          success: false,
          fallback: true,
          provider: 'deterministic-fallback',
          error: `Internal server error: ${err.message}`,
        })
      );
    }
  });
}
