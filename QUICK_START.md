# Quick Start Guide - Figma MCP Bridge

Get up and running in 15 minutes! 🚀

---

## What You're Building

A REST API bridge that lets Writer Agent:
1. Generate images using AI
2. Automatically inject them into Figma templates
3. Export final designs programmatically

**No manual Figma work required!**

---

## 15-Minute Setup

### Minute 0-5: Get Figma Credentials

1. Go to: https://www.figma.com/developers
2. Click "Create new app" or "My apps"
3. Create app named "Writer Agent Bridge"
4. Set redirect URI: `https://figma-mcp-bridge.onrender.com/auth/figma/callback`
   - (You can change this later after deploying)
5. Save your **Client ID** and **Client Secret**

---

### Minute 5-10: Deploy to Render

1. **Push to GitHub:**
   ```bash
   cd figma-mcp-bridge
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to https://render.com/dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Name: `figma-mcp-bridge`
   - Build: `npm install`
   - Start: `npm start`
   - Click "Create Web Service"

3. **Add Environment Variables:**
   ```
   FIGMA_CLIENT_ID=your_client_id
   FIGMA_CLIENT_SECRET=your_client_secret
   BASE_URL=https://figma-mcp-bridge.onrender.com
   NODE_ENV=production
   ```

4. Wait 2-3 minutes for deployment ✅

---

### Minute 10-12: Authenticate & Get API Key

1. Visit: `https://YOUR-APP-NAME.onrender.com/auth/figma`
2. Click "Allow Access" on Figma's page
3. Copy your API key (starts with `figma_`)
4. **Save it securely!**

---

### Minute 12-15: Connect to Writer

1. Go to Writer AI Studio → Integrations → Custom Connectors
2. Click "Add Custom Connector"
3. Upload `openapi.yaml` from this repo
4. Add your API key:
   - Header: `X-API-Key`
   - Value: Your API key from step 10-12
5. Test connection with `/health` endpoint ✅

---

## Your First Test

### Test 1: Health Check

```bash
curl https://YOUR-APP-NAME.onrender.com/health
```

Expected:
```json
{
  "status": "ok",
  "service": "figma-mcp-bridge",
  "version": "1.0.0"
}
```

### Test 2: Create Figma Template

1. Open Figma
2. Create a simple frame (F)
3. Add a rectangle (R) inside
4. Name it `hero_image`
5. Get File Key from URL: `https://www.figma.com/file/ABC123/...`
6. Get Node ID: Right-click rectangle → Copy link → Extract `node-id=1:2`

### Test 3: Inject Image (from Writer Agent)

In Writer Agent, prompt:
```
"Generate a landscape photo and inject it into my Figma file ABC123, node 1:2"
```

Agent will:
1. Generate image
2. Call your bridge API
3. Update Figma
4. Confirm success ✅

---

## What You Built

```
┌─────────────────┐
│  Writer Agent   │
│  (User Input)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Image Generator │
│ (AI creates img)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   MCP Bridge    │   ◄── You built this!
│  (Your API)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Figma MCP      │
│ (OAuth + Write) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Figma Templates│
│ (Updated files) │
└─────────────────┘
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `server.js` | Main API server |
| `openapi.yaml` | API spec for Writer |
| `package.json` | Dependencies |
| `.env.example` | Config template |
| `render.yaml` | Render deployment |
| `README.md` | Full documentation |
| `DEPLOYMENT.md` | Detailed deploy guide |
| `USAGE_WITH_WRITER.md` | Writer Agent usage |

---

## API Quick Reference

### Main Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/auth/figma` | GET | Start OAuth |
| `/api/figma/update-image` | POST | **Inject image** |
| `/api/figma/export` | POST | Export design |
| `/api/figma/tools` | GET | List MCP tools |

### Update Image Request

```json
{
  "fileKey": "abc123",
  "nodeId": "1:2",
  "imageUrl": "https://example.com/image.jpg",
  "scaleMode": "FILL"
}
```

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Invalid API key" | Re-run OAuth at `/auth/figma` |
| "Authentication failed" | Check env vars on Render |
| "Failed to update image" | Verify fileKey and nodeId |
| Service won't start | Check Render logs |
| OAuth redirect error | Update redirect URI in Figma app |

---

## Next Steps

### Beginner
1. ✅ Complete setup above
2. ✅ Test with one template
3. ✅ Create first automated workflow

### Intermediate
1. Create multiple templates
2. Build Writer Agent playbooks
3. Add error handling

### Advanced
1. Batch processing
2. Webhook integration
3. Custom automation pipelines

---

## Example Use Cases

### Social Media Content
```
User: "Create 5 Instagram posts about our product"
→ Agent generates 5 images
→ Injects into Instagram template
→ Exports all 5 designs
```

### Product Cards
```
User: "Update all product cards with new photos"
→ Agent loops through products
→ Updates each template
→ Confirms completion
```

### Personalized Marketing
```
User: "Generate personalized cards for 100 customers"
→ Agent processes batch
→ Creates unique designs
→ Exports all cards
```

---

## Pro Tips

1. **Name Layers Clearly**
   - `hero_image` not "Rectangle 1"
   - Makes automations easier

2. **Document Node IDs**
   - Keep a list of fileKey:nodeId pairs
   - Speeds up development

3. **Use Scale Modes**
   - Photos → `FILL`
   - Logos → `FIT`
   - Patterns → `TILE`

4. **Monitor Logs**
   - Check Render dashboard
   - Watch for errors early

5. **Test Incrementally**
   - Start with 1 image
   - Scale to batches
   - Add complexity gradually

---

## Resources

- **Full Docs**: See `README.md`
- **Deployment**: See `DEPLOYMENT.md`
- **Writer Usage**: See `USAGE_WITH_WRITER.md`
- **Figma MCP**: https://developers.figma.com/docs/figma-mcp-server/
- **Render Docs**: https://render.com/docs
- **Support**: Check repo issues

---

## Troubleshooting Command

If something goes wrong:

```bash
# Check service health
curl https://YOUR-APP-NAME.onrender.com/health

# View Render logs
# Go to Render Dashboard → Your Service → Logs

# Test OAuth
# Visit: https://YOUR-APP-NAME.onrender.com/auth/figma

# Test with curl
curl -H "X-API-Key: YOUR_KEY" \
  https://YOUR-APP-NAME.onrender.com/api/figma/tools
```

---

## You're Ready! 🎉

You now have:
- ✅ Figma MCP Bridge deployed
- ✅ OAuth configured
- ✅ Writer Agent connected
- ✅ API ready to use

**Start creating automated design workflows!**

Questions? Check the detailed docs in this repo.

Happy automating! 🚀