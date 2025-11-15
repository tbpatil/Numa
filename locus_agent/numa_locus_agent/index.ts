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
  // Validate environment variables
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      success: false,
      error: 'ANTHROPIC_API_KEY is not set in environment variables'
    };
  }
  if (!process.env.LOCUS_API_KEY) {
    return {
      success: false,
      error: 'LOCUS_API_KEY is not set in environment variables'
    };
  }

  const options = getLocusOptions();
  let finalResult: any = null;
  let mcpStatus: any = null;
  let errorMessage: string | null = null;

  try {
    console.log('Starting query with prompt:', prompt.substring(0, 100) + '...');
    console.log('MCP servers configured:', Object.keys(options.mcpServers || {}));
    
    for await (const message of query({
      prompt,
      options
    })) {
      // Log all message types for debugging
      console.log(`Received message type: ${message.type}, subtype: ${(message as any).subtype || 'none'}`);
      
      if (message.type === 'system' && message.subtype === 'init') {
        // Check MCP connection status
        const mcpServersInfo = (message as any).mcp_servers;
        console.log('MCP servers info:', JSON.stringify(mcpServersInfo, null, 2));
        mcpStatus = mcpServersInfo?.find((s: any) => s.name === 'locus');
        if (mcpStatus) {
          console.log('Locus MCP status:', mcpStatus.status);
          if (mcpStatus.status !== 'connected') {
            errorMessage = `MCP server connection failed: ${mcpStatus.status}`;
          }
        } else {
          console.warn('Locus MCP server not found in servers list');
        }
      } else if (message.type === 'result') {
        if ((message as any).subtype === 'success') {
          finalResult = (message as any).result;
          console.log('Query result received');
        } else if ((message as any).subtype === 'error') {
          const error = (message as any).error || message;
          errorMessage = error instanceof Error ? error.message : String(error);
          console.error('Error in result:', error);
        }
      } else if (message.type === 'error_during_execution' || message.type === 'error') {
        const error = (message as any).error || message;
        errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error during execution:', error);
        console.error('Full error object:', JSON.stringify(message, null, 2));
      } else {
        // Log any other message types we're not explicitly handling
        console.log('Unhandled message type:', JSON.stringify(message, null, 2));
      }
    }

    if (errorMessage) {
      return {
        success: false,
        error: errorMessage,
        mcpStatus: mcpStatus?.status || 'unknown'
      };
    }

    return {
      success: true,
      result: finalResult,
      mcpStatus: mcpStatus?.status || 'unknown'
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    console.error('Error in processPrompt:', err);
    console.error('Error stack:', errorStack);
    console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    
    // Check if it's a process exit error
    if (errorMsg.includes('exited with code') || errorMsg.includes('process exited')) {
      return {
        success: false,
        error: `Claude SDK process crashed: ${errorMsg}. This usually indicates an issue with API keys, MCP server connection, or SDK configuration. Check your environment variables and Locus API key.`,
        mcpStatus: mcpStatus?.status || 'unknown'
      };
    }
    
    return {
      success: false,
      error: errorMsg,
      mcpStatus: mcpStatus?.status || 'unknown'
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
  console.log('Environment check:');
  console.log(`  ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'Set (' + process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...)' : 'NOT SET'}`);
  console.log(`  LOCUS_API_KEY: ${process.env.LOCUS_API_KEY ? 'Set (' + process.env.LOCUS_API_KEY.substring(0, 10) + '...)' : 'NOT SET'}\n`);

  try {
    const result = await processPrompt(prompt);

    if (result.success) {
      console.log(`✓ Query completed successfully\n`);
      res.json(result);
    } else {
      console.error(`❌ Query failed: ${result.error}\n`);
      res.status(500).json(result);
    }
  } catch (err) {
    console.error('Unexpected error in /query endpoint:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : String(err)
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  const hasLocusKey = !!process.env.LOCUS_API_KEY;
  
  res.json({ 
    status: 'ok', 
    service: 'locus-agent',
    env: {
      hasAnthropicKey,
      hasLocusKey,
      anthropicKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
      locusKeyLength: process.env.LOCUS_API_KEY?.length || 0
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎯 Locus Agent API running on http://localhost:${PORT}`);
  console.log(`📡 POST /query - Send a prompt to process through Locus`);
  console.log(`💚 GET /health - Health check\n`);
});
