import 'dotenv/config';
import express from 'express';
import { query } from '@anthropic-ai/claude-agent-sdk';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Configure MCP connection to Locus
const getLocusOptions = () => {
  const mcpServers = {
    'locus': {
      type: 'http' as const,
      url: 'https://mcp.paywithlocus.com/mcp',
      headers: {
        'Authorization': `Bearer ${process.env.LOCUS_API_KEY}`
      }
    }
  };

  return {
    mcpServers,
    allowedTools: [
      'mcp__locus__*',      // Allow all Locus tools
      'mcp__list_resources',
      'mcp__read_resource'
    ],
    apiKey: process.env.ANTHROPIC_API_KEY,
    // Auto-approve Locus tool usage
    canUseTool: async (toolName: string, input: Record<string, unknown>) => {
      if (toolName.startsWith('mcp__locus__')) {
        return {
          behavior: 'allow' as const,
          updatedInput: input
        };
      }
      return {
        behavior: 'deny' as const,
        message: 'Only Locus tools are allowed'
      };
    }
  };
};

// Process a prompt through Locus
async function processPrompt(prompt: string) {
  const options = getLocusOptions();
  let finalResult: any = null;
  let mcpStatus: any = null;

  try {
    for await (const message of query({
      prompt,
      options
    })) {
      if (message.type === 'system' && message.subtype === 'init') {
        // Check MCP connection status
        const mcpServersInfo = (message as any).mcp_servers;
        mcpStatus = mcpServersInfo?.find((s: any) => s.name === 'locus');
      } else if (message.type === 'result' && message.subtype === 'success') {
        finalResult = (message as any).result;
      }
    }

    return {
      success: true,
      result: finalResult,
      mcpStatus: mcpStatus?.status || 'unknown'
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

// POST endpoint to process prompts
app.post('/query', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required and must be a string'
    });
  }

  console.log(`\n📨 Received prompt: ${prompt}\n`);

  const result = await processPrompt(prompt);

  if (result.success) {
    console.log(`✓ Query completed successfully\n`);
    res.json(result);
  } else {
    console.error(`❌ Query failed: ${result.error}\n`);
    res.status(500).json(result);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'locus-agent' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎯 Locus Agent API running on http://localhost:${PORT}`);
  console.log(`📡 POST /query - Send a prompt to process through Locus`);
  console.log(`💚 GET /health - Health check\n`);
});
