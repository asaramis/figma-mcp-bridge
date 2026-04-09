const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// In-memory token storage (use Redis/DB in production)
const tokenStore = new Map();

// ============================================================
// FIGMA OAUTH ROUTES
// ============================================================

// Start OAuth flow
app.get('/auth/figma', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  const redirectUri = `${process.env.BASE_URL}/auth/figma/callback`;
  
  const authUrl = `https://www.figma.com/oauth` +
    `?client_id=${process.env.FIGMA_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=file_content:read,file_dev_resources:write,file_metadata:read,current_user:read` +
    `&state=${state}` +
    `&response_type=code`;
  
  res.redirect(authUrl);
});


// OAuth callback
app.get('/auth/figma/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.status(400).send('Authorization code missing');
  }

  try {
    const redirectUri = `${process.env.BASE_URL}/auth/figma/callback`;
    
    // Exchange code for access token
    const response = await axios.post('https://www.figma.com/api/oauth/token', {
      client_id: process.env.FIGMA_CLIENT_ID,
      client_secret: process.env.FIGMA_CLIENT_SECRET,
      redirect_uri: redirectUri,
      code: code,
      grant_type: 'authorization_code'
    });

    const { access_token, refresh_token, expires_in } = response.data;
    
    // Generate API key for Writer to use
    const apiKey = 'figma_' + Math.random().toString(36).substring(2, 15);
    
    // Store tokens
    tokenStore.set(apiKey, {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + (expires_in * 1000)
    });

    res.send(`
      <html>
        <body>
          <h1>Authentication Successful!</h1>
          <p>Your API Key (save this for Writer AI Studio):</p>
          <code style="background: #f4f4f4; padding: 10px; display: block; margin: 10px 0;">
            ${apiKey}
          </code>
          <p>Use this API key in your Writer AI Studio custom connector configuration.</p>
          <p>You can close this window now.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth error:', error.response?.data || error.message);
    res.status(500).send('Authentication failed');
  }
});

// ============================================================
// MCP BRIDGE HELPERS
// ============================================================

// Get valid access token (refresh if needed)
async function getAccessToken(apiKey) {
  const tokens = tokenStore.get(apiKey);
  
  if (!tokens) {
    throw new Error('Invalid API key');
  }

  // Check if token needs refresh
  if (Date.now() >= tokens.expiresAt - 60000) {
    // Refresh token
    const response = await axios.post('https://www.figma.com/api/oauth/refresh', {
      client_id: process.env.FIGMA_CLIENT_ID,
      client_secret: process.env.FIGMA_CLIENT_SECRET,
      refresh_token: tokens.refreshToken
    });

    tokens.accessToken = response.data.access_token;
    tokens.expiresAt = Date.now() + (response.data.expires_in * 1000);
    tokenStore.set(apiKey, tokens);
  }

  return tokens.accessToken;
}

// Call Figma MCP server
async function callFigmaMCP(accessToken, tool, args) {
  const response = await axios.post(
    'https://mcp.figma.com/mcp',
    {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: tool,
        arguments: args
      },
      id: Date.now()
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.result;
}

// ============================================================
// REST API ENDPOINTS
// ============================================================

// Middleware to check API key
function requireAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || !tokenStore.has(apiKey)) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  
  req.apiKey = apiKey;
  next();
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'figma-mcp-bridge',
    version: '1.0.0'
  });
});

// Get file info
app.get('/api/figma/file/:fileKey', requireAuth, async (req, res) => {
  try {
    const accessToken = await getAccessToken(req.apiKey);
    const { fileKey } = req.params;

    const result = await callFigmaMCP(accessToken, 'get_file', {
      file_key: fileKey
    });

    res.json(result);
  } catch (error) {
    console.error('Error getting file:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to get file info',
      details: error.response?.data || error.message 
    });
  }
});

// Get node/frame info
app.get('/api/figma/file/:fileKey/node/:nodeId', requireAuth, async (req, res) => {
  try {
    const accessToken = await getAccessToken(req.apiKey);
    const { fileKey, nodeId } = req.params;

    const result = await callFigmaMCP(accessToken, 'get_node', {
      file_key: fileKey,
      node_id: nodeId
    });

    res.json(result);
  } catch (error) {
    console.error('Error getting node:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to get node info',
      details: error.response?.data || error.message 
    });
  }
});

// Update image fill in a node (THE KEY ENDPOINT!)
app.post('/api/figma/update-image', requireAuth, async (req, res) => {
  try {
    const accessToken = await getAccessToken(req.apiKey);
    const { fileKey, nodeId, imageUrl, imageBase64, scaleMode } = req.body;

    if (!fileKey || !nodeId) {
      return res.status(400).json({ 
        error: 'Missing required fields: fileKey, nodeId' 
      });
    }

    if (!imageUrl && !imageBase64) {
      return res.status(400).json({ 
        error: 'Must provide either imageUrl or imageBase64' 
      });
    }

    // Call MCP tool to update image
    const result = await callFigmaMCP(accessToken, 'update_node_image_fill', {
      file_key: fileKey,
      node_id: nodeId,
      image_url: imageUrl,
      image_base64: imageBase64,
      scale_mode: scaleMode || 'FILL'
    });

    res.json({ 
      success: true,
      result 
    });
  } catch (error) {
    console.error('Error updating image:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to update image',
      details: error.response?.data || error.message 
    });
  }
});

// Export frame/node as image
app.post('/api/figma/export', requireAuth, async (req, res) => {
  try {
    const accessToken = await getAccessToken(req.apiKey);
    const { fileKey, nodeId, format, scale } = req.body;

    if (!fileKey || !nodeId) {
      return res.status(400).json({ 
        error: 'Missing required fields: fileKey, nodeId' 
      });
    }

    const result = await callFigmaMCP(accessToken, 'export_node', {
      file_key: fileKey,
      node_id: nodeId,
      format: format || 'PNG',
      scale: scale || 2
    });

    res.json(result);
  } catch (error) {
    console.error('Error exporting node:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to export node',
      details: error.response?.data || error.message 
    });
  }
});

// List available MCP tools
app.get('/api/figma/tools', requireAuth, async (req, res) => {
  try {
    const accessToken = await getAccessToken(req.apiKey);

    const response = await axios.post(
      'https://mcp.figma.com/mcp',
      {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: Date.now()
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data.result);
  } catch (error) {
    console.error('Error listing tools:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to list tools',
      details: error.response?.data || error.message 
    });
  }
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log(`🚀 Figma MCP Bridge running on port ${PORT}`);
  console.log(`📝 Start OAuth: ${process.env.BASE_URL}/auth/figma`);
});
