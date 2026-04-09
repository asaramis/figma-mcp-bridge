# Figma MCP Bridge - Project Summary

**Complete REST API bridge enabling Writer Agent to inject images into Figma templates via Figma's MCP server**

---

## Project Overview

### What This Solves

**The Problem:**
- Figma's MCP server uses Model Context Protocol (not REST)
- Writer AI Studio's custom connectors only support REST APIs (OpenAPI)
- You wanted to automate: Generate images in Writer Agent → Inject into Figma templates

**The Solution:**
This bridge translates between REST and MCP protocols, enabling seamless integration between Writer Agent and Figma's write-to-canvas capabilities.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Writer Agent                         │
│  (User: "Generate image and inject into Figma")         │
└───────────────────┬──────────────────────────────────────┘
                    │ REST API Call
                    ▼
┌──────────────────────────────────────────────────────────┐
│              Figma MCP Bridge (Your API)                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │   OAuth    │  │   Token    │  │ REST→MCP   │        │
│  │   Handler  │→ │   Manager  │→ │ Translator │        │
│  └────────────┘  └────────────┘  └────────────┘        │
└───────────────────┬──────────────────────────────────────┘
                    │ MCP Protocol
                    ▼
┌──────────────────────────────────────────────────────────┐
│                  Figma MCP Server                        │
│              https://mcp.figma.com/mcp                   │
└───────────────────┬──────────────────────────────────────┘
                    │ Write to Canvas
                    ▼
┌──────────────────────────────────────────────────────────┐
│                    Figma Files                           │
│         (Templates with updated images)                  │
└──────────────────────────────────────────────────────────┘
```

---

## Key Features

### ✅ OAuth 2.0 Authentication
- Handles full Figma OAuth flow
- Automatic token refresh
- Secure token storage
- API key generation for clients

### ✅ REST to MCP Translation
- Converts REST API calls to MCP protocol
- Translates responses back to JSON
- Error handling and retries
- Rate limit management

### ✅ Core Endpoints

1. **Update Image** (Primary Feature)
   - Inject images into Figma nodes
   - Support for URL and Base64
   - Multiple scale modes (FILL, FIT, CROP, TILE)

2. **Export Design**
   - Export frames as PNG, JPG, SVG, PDF
   - Configurable scale and quality

3. **File & Node Info**
   - Get file metadata
   - Query node properties
   - List available tools

### ✅ Writer AI Studio Integration
- OpenAPI 3.0 specification
- API key authentication
- Full CRUD operations
- Batch processing support

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| HTTP Client | Axios |
| Auth | OAuth 2.0 |
| Protocol | MCP + REST |
| Deployment | Render (free tier) |
| Integration | Writer AI Studio |

---

## File Structure

```
figma-mcp-bridge/
├── server.js              # Main API server (OAuth + REST→MCP)
├── package.json           # Dependencies
├── openapi.yaml           # API spec for Writer AI Studio
├── render.yaml            # Render deployment config
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
│
├── README.md              # Main documentation
├── QUICK_START.md         # 15-minute setup guide
├── DEPLOYMENT.md          # Detailed deployment steps
├── USAGE_WITH_WRITER.md   # Writer Agent usage examples
└── PROJECT_SUMMARY.md     # This file
```

---

## Deployment Status

### Required Setup Steps

- [ ] Push code to GitHub
- [ ] Create Render web service
- [ ] Set environment variables
- [ ] Create Figma OAuth app
- [ ] Complete OAuth flow
- [ ] Get API key
- [ ] Upload OpenAPI spec to Writer
- [ ] Test connection

### Environment Variables

```bash
FIGMA_CLIENT_ID=your_figma_client_id
FIGMA_CLIENT_SECRET=your_figma_client_secret
BASE_URL=https://your-app.onrender.com
NODE_ENV=production
PORT=3000
```

---

## API Documentation

### Base URL
```
https://your-app-name.onrender.com
```

### Authentication
```
Header: X-API-Key
Value: figma_abc123xyz (from OAuth flow)
```

### Primary Endpoints

#### 1. Update Image (Core Feature)
```http
POST /api/figma/update-image
Content-Type: application/json
X-API-Key: your_api_key

{
  "fileKey": "abc123",
  "nodeId": "1:2",
  "imageUrl": "https://example.com/image.jpg",
  "scaleMode": "FILL"
}
```

#### 2. Export Design
```http
POST /api/figma/export
Content-Type: application/json
X-API-Key: your_api_key

{
  "fileKey": "abc123",
  "nodeId": "1:2",
  "format": "PNG",
  "scale": 2
}
```

#### 3. Get File Info
```http
GET /api/figma/file/{fileKey}
X-API-Key: your_api_key
```

---

## Usage Examples

### Example 1: Simple Image Injection

**User Request (Writer Agent):**
```
"Generate a hero image and add it to my Figma template"
```

**Agent Workflow:**
1. Calls `image_edit_or_generate` → creates `hero.jpg`
2. Gets public URL for image
3. Calls Figma bridge: `POST /api/figma/update-image`
4. Confirms success to user

**Result:** Image automatically injected! ✅

---

### Example 2: Batch Processing

**User Request:**
```
"Create 10 product cards with different images"
```

**Agent Workflow:**
1. Loop 10 times:
   - Generate product image
   - Inject into template (different node each time)
2. Export all 10 designs
3. Deliver batch to user

**Result:** 10 automated designs in minutes! ✅

---

## Integration with Writer Agent

### Custom Connector Setup

1. **Upload OpenAPI Spec**
   - File: `openapi.yaml`
   - Location: Writer AI Studio → Integrations → Custom Connectors

2. **Configure Authentication**
   - Type: API Key
   - Header: `X-API-Key`
   - Value: From OAuth flow

3. **Test Connection**
   - Endpoint: `/health`
   - Expected: `{"status": "ok"}`

### Available in Writer Agent

After setup, these functions are available:
- `FIGMA_UPDATE_IMAGE` - Inject images
- `FIGMA_EXPORT_DESIGN` - Export designs
- `FIGMA_GET_FILE` - Get file info
- `FIGMA_GET_NODE` - Get node details
- `FIGMA_LIST_TOOLS` - List MCP tools

---

## Cost Analysis

### Development Costs
- **Time to Build**: 2-3 hours
- **Complexity**: Medium
- **Maintenance**: Low

### Deployment Costs

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Render | $0/month (750hrs) | $7/month (Starter) |
| Figma MCP | $0 (beta period) | Usage-based (TBD) |
| Writer AI Studio | Included | Included |
| **Total** | **$0/month** | **$7/month** |

### Free Tier Limitations
- Render: Spins down after 15 min inactivity
- First request after spin-down: ~30 seconds
- Suitable for: Development, testing, low-volume production

### When to Upgrade
- High-volume usage (>100 requests/day)
- Need always-on availability
- Production workloads
- Business-critical automation

---

## Security & Compliance

### Security Features
- ✅ OAuth 2.0 authentication
- ✅ HTTPS-only (Render default)
- ✅ API key rotation support
- ✅ Token auto-refresh
- ✅ Environment variable secrets
- ✅ No tokens in code/logs

### Best Practices
1. Never commit `.env` file
2. Rotate API keys regularly
3. Monitor API usage
4. Use HTTPS only
5. Keep dependencies updated

---

## Performance Metrics

### Expected Performance

| Operation | Time | Notes |
|-----------|------|-------|
| OAuth flow | ~3 seconds | One-time setup |
| Image injection | ~2-5 seconds | Depends on image size |
| Export design | ~3-8 seconds | Depends on complexity |
| Health check | <100ms | Fast response |

### Bottlenecks
1. Image upload to Figma
2. MCP server processing
3. Figma file complexity
4. Network latency

### Optimization Tips
- Pre-optimize images before upload
- Use appropriate scale modes
- Cache frequently used templates
- Batch similar requests

---

## Testing Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] Environment variables configured
- [ ] Figma OAuth app created
- [ ] Render service created

### Post-Deployment
- [ ] Health check returns 200 OK
- [ ] OAuth flow completes successfully
- [ ] API key generated
- [ ] Test image injection works
- [ ] Test export works
- [ ] Writer connector configured
- [ ] End-to-end workflow tested

### Production Readiness
- [ ] Error handling tested
- [ ] Rate limits understood
- [ ] Monitoring configured
- [ ] Documentation complete
- [ ] Backup plan ready

---

## Troubleshooting Guide

### Common Issues

1. **OAuth fails**
   - Check CLIENT_ID and CLIENT_SECRET
   - Verify redirect URI matches
   - Ensure BASE_URL is correct

2. **API returns 401**
   - Re-run OAuth flow
   - Get fresh API key
   - Update Writer connector

3. **Image injection fails**
   - Verify fileKey and nodeId
   - Check image URL is public
   - Ensure node supports fills

4. **Service won't start**
   - Check Render logs
   - Verify env vars set
   - Check Node version (18+)

---

## Future Enhancements

### Phase 2 Features
- [ ] Persistent token storage (Redis/DB)
- [ ] Webhook support for async operations
- [ ] Batch endpoint for multiple images
- [ ] Template management UI
- [ ] Analytics dashboard
- [ ] Rate limiting per user

### Phase 3 Features
- [ ] Multi-user support
- [ ] Team collaboration
- [ ] Advanced caching
- [ ] Custom MCP tools
- [ ] Figma plugin companion

---

## Success Metrics

### Key Performance Indicators

1. **API Availability**: Target 99.5% uptime
2. **Response Time**: <5 seconds for image injection
3. **Success Rate**: >95% successful operations
4. **User Adoption**: Track active users/month

### Monitoring Tools
- Render dashboard (logs, metrics)
- Custom health checks
- Error reporting
- Usage analytics

---

## Documentation Links

- **Quick Start**: [QUICK_START.md](QUICK_START.md) - Get running in 15 minutes
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed setup guide
- **Usage**: [USAGE_WITH_WRITER.md](USAGE_WITH_WRITER.md) - Writer Agent examples
- **Main Docs**: [README.md](README.md) - Complete documentation

---

## Support & Resources

### Documentation
- Figma MCP: https://developers.figma.com/docs/figma-mcp-server/
- Writer AI Studio: https://writer.com/docs/
- Render: https://render.com/docs
- Node.js: https://nodejs.org/docs/

### Community
- Figma Forum: https://forum.figma.com/
- Render Community: https://community.render.com/
- GitHub Issues: [Your repo URL]

---

## Project Status

**Status**: ✅ **READY FOR DEPLOYMENT**

**Created**: 2026-04-08  
**Version**: 1.0.0  
**Last Updated**: 2026-04-08

**Next Steps**:
1. Deploy to Render
2. Complete OAuth setup
3. Test with Writer Agent
4. Go live! 🚀

---

## Credits

**Built for**: Ranjan Roy @ Writer  
**Purpose**: Enable automated image injection from Writer Agent to Figma  
**Technology**: Node.js + Express + Figma MCP + Writer AI Studio  
**Architecture**: REST API Bridge to MCP Protocol

---

🎉 **Ready to automate your design workflow!**