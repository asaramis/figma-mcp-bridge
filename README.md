# Figma MCP Bridge API

REST API bridge that translates between Writer AI Studio and Figma's MCP server, enabling automated image injection into Figma templates.

## What This Does

This bridge allows Writer Agent to:
1. Generate images using `image_edit_or_generate` tool
2. Inject those images into Figma templates
3. Export the final designs programmatically

All through simple REST API calls!

## Architecture

```
Writer Agent → REST API Bridge → Figma MCP Server → Figma Files
                (This service)    (OAuth)
```

## Setup Instructions

### Step 1: Create Figma OAuth App

1. Go to https://www.figma.com/developers/api#authentication
2. Click "Get a personal access token" or create an OAuth app
3. For OAuth app:
   - Name: "Writer Agent Bridge"
   - Redirect URI: `https://your-render-url.onrender.com/auth/figma/callback`
   - Scopes: `file_read`, `file_write`
4. Save your `Client ID` and `Client Secret`

### Step 2: Deploy to Render

1. Push this code to GitHub
2. Create new Web Service on Render
3. Connect your GitHub repo
4. Set environment variables:
   ```
   FIGMA_CLIENT_ID=your_client_id
   FIGMA_CLIENT_SECRET=your_client_secret
   BASE_URL=https://your-app-name.onrender.com
   ```
5. Deploy!

### Step 3: Authenticate

1. Visit: `https://your-app-name.onrender.com/auth/figma`
2. Click "Allow Access" on Figma's OAuth page
3. Copy the API key shown on the success page
4. Save this API key for Writer AI Studio

### Step 4: Connect to Writer AI Studio

1. Go to Writer AI Studio → Integrations → Custom Connectors
2. Upload the `openapi.yaml` file from this repo
3. Add your API key as authentication header: `X-API-Key: your_api_key`
4. Test the connection!

## API Endpoints

### Authentication
- `GET /auth/figma` - Start OAuth flow
- `GET /auth/figma/callback` - OAuth callback (automatic)

### Core Endpoints
- `GET /health` - Health check
- `GET /api/figma/file/:fileKey` - Get file info
- `GET /api/figma/file/:fileKey/node/:nodeId` - Get node/frame info
- `POST /api/figma/update-image` - **Update image in Figma node**
- `POST /api/figma/export` - Export frame as image
- `GET /api/figma/tools` - List available MCP tools

### Key Endpoint: Update Image

```bash
POST /api/figma/update-image
Headers:
  X-API-Key: your_api_key
  Content-Type: application/json

Body:
{
  "fileKey": "abc123",
  "nodeId": "1:2",
  "imageUrl": "https://example.com/image.jpg",
  "scaleMode": "FILL"
}
```

Scale modes: `FILL`, `FIT`, `CROP`, `TILE`

## Usage Example with Writer Agent

```markdown
User: "Create a social media post for our new product"

Agent workflow:
1. Generate image → image_edit_or_generate
2. Get public URL for generated image
3. Call Figma MCP bridge:
   - File: social-media-template.fig
   - Node: hero_image
   - Image: generated_image.png
4. Export final design
5. Deliver to user
```

## Getting Figma File/Node IDs

### File Key
From Figma URL: `https://www.figma.com/file/ABC123/Design`
File Key = `ABC123`

### Node ID  
1. Select layer in Figma
2. Right-click → Copy/Paste → Copy as → Copy link
3. URL looks like: `https://www.figma.com/file/ABC123/Design?node-id=1:2`
4. Node ID = `1:2`

Or use the MCP bridge to list nodes in a file first!

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FIGMA_CLIENT_ID` | OAuth client ID | `abc123xyz` |
| `FIGMA_CLIENT_SECRET` | OAuth client secret | `secret_key_here` |
| `BASE_URL` | Your deployment URL | `https://figma-bridge.onrender.com` |
| `PORT` | Server port (set by Render) | `3000` |

## Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **Axios** - HTTP client
- **Figma MCP Protocol** - Communication with Figma
- **OAuth 2.0** - Authentication

## Rate Limits

Figma MCP server has rate limits:
- Check current limits at: https://developers.figma.com/docs/figma-mcp-server/plans-access-and-permissions/

## Troubleshooting

### "Invalid API key"
- Make sure you completed OAuth flow
- Check that API key matches the one from `/auth/figma/callback`

### "Authentication failed"
- Verify FIGMA_CLIENT_ID and FIGMA_CLIENT_SECRET
- Check redirect URI matches your Figma OAuth app settings

### "Failed to update image"
- Verify fileKey and nodeId are correct
- Check that node supports image fills (Rectangle/Frame)
- Ensure image URL is publicly accessible

## Security Notes

- API keys are stored in memory (use Redis/DB for production)
- Tokens are refreshed automatically
- All requests go through Figma's OAuth
- Never commit `.env` to git

## Next Steps

After setup:
1. Test with a simple Figma template
2. Create Writer Agent workflow
3. Automate your image generation pipeline!

## Support

Issues? Check:
- Figma MCP docs: https://developers.figma.com/docs/figma-mcp-server/
- Writer AI Studio docs: https://writer.com/docs/