# Deployment Guide - Figma MCP Bridge

Complete step-by-step guide to deploy your Figma MCP Bridge to Render and connect it to Writer AI Studio.

## Prerequisites

- GitHub account
- Render account (free tier works!)
- Figma account with design files
- Writer AI Studio access

---

## Step 1: Create Figma OAuth Application

1. **Go to Figma Developer Settings**
   - Visit: https://www.figma.com/developers
   - Sign in with your Figma account

2. **Create New App**
   - Click "Create new app" or "My apps"
   - Fill in details:
     - **Name**: `Writer Agent Bridge`
     - **Description**: `REST API bridge for Writer Agent`
     - **Website**: Your website or GitHub repo URL

3. **Configure OAuth Settings**
   - **Redirect URI**: `https://YOUR-APP-NAME.onrender.com/auth/figma/callback`
     - ⚠️ You'll update this after deploying to Render
     - For now, use: `https://figma-mcp-bridge.onrender.com/auth/figma/callback`
   - **Scopes**: Select `file_read` and `file_write`

4. **Save Credentials**
   - Copy your `Client ID` (starts with letters/numbers)
   - Copy your `Client Secret` (keep this secure!)
   - Save these for Step 3

---

## Step 2: Deploy to Render

### Option A: Deploy via GitHub (Recommended)

1. **Push Code to GitHub**
   ```bash
   cd figma-mcp-bridge
   git init
   git add .
   git commit -m "Initial commit - Figma MCP Bridge"
   git remote add origin https://github.com/YOUR-USERNAME/figma-mcp-bridge.git
   git push -u origin main
   ```

2. **Create Render Web Service**
   - Go to https://render.com/dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `figma-mcp-bridge` repo

3. **Configure Service**
   - **Name**: `figma-mcp-bridge` (or your preferred name)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave blank (or `.` if monorepo)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if you need more)

4. **Add Environment Variables**
   Click "Environment" tab and add:
   
   | Key | Value |
   |-----|-------|
   | `FIGMA_CLIENT_ID` | Your Client ID from Step 1 |
   | `FIGMA_CLIENT_SECRET` | Your Client Secret from Step 1 |
   | `BASE_URL` | `https://YOUR-APP-NAME.onrender.com` |
   | `NODE_ENV` | `production` |

   ⚠️ **Replace `YOUR-APP-NAME` with your actual Render service name!**

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Your service will be live at: `https://YOUR-APP-NAME.onrender.com`

### Option B: Deploy via Dashboard Upload

1. **Zip Your Code**
   ```bash
   zip -r figma-mcp-bridge.zip figma-mcp-bridge/
   ```

2. **Manual Deploy on Render**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Choose "Deploy from repo"
   - Upload your zip file
   - Follow steps 3-5 from Option A

---

## Step 3: Update Figma OAuth Redirect URI

1. **Get Your Render URL**
   - After deployment, your app is at: `https://YOUR-APP-NAME.onrender.com`
   - Example: `https://figma-mcp-bridge.onrender.com`

2. **Update Figma App Settings**
   - Go back to https://www.figma.com/developers
   - Open your app
   - Update **Redirect URI** to:
     ```
     https://YOUR-ACTUAL-APP-NAME.onrender.com/auth/figma/callback
     ```
   - Save changes

3. **Update BASE_URL on Render**
   - Go to Render Dashboard → Your Service
   - Click "Environment" tab
   - Update `BASE_URL` to match your actual URL
   - Click "Save Changes" (triggers redeploy)

---

## Step 4: Authenticate & Get API Key

1. **Start OAuth Flow**
   - Visit: `https://YOUR-APP-NAME.onrender.com/auth/figma`
   - You'll be redirected to Figma
   - Click "Allow Access"

2. **Copy Your API Key**
   - After authorization, you'll see a success page
   - Copy the API key shown (starts with `figma_`)
   - **Save this securely!** You'll need it for Writer AI Studio

   Example: `figma_abc123xyz789`

---

## Step 5: Connect to Writer AI Studio

1. **Go to Writer AI Studio**
   - Navigate to: Integrations → Connectors → Custom Connectors
   - Click "Add Custom Connector"

2. **Upload OpenAPI Spec**
   - Upload the `openapi.yaml` file from your repo
   - Or copy/paste the YAML content

3. **Configure Authentication**
   - **Auth Type**: API Key
   - **Header Name**: `X-API-Key`
   - **API Key**: Paste your API key from Step 4

4. **Update Server URL**
   - In the OpenAPI spec, update the server URL:
     ```yaml
     servers:
       - url: https://YOUR-ACTUAL-APP-NAME.onrender.com
         description: Production server
     ```

5. **Test Connection**
   - Click "Test" in Writer AI Studio
   - Try the `/health` endpoint
   - Should return: `{"status":"ok","service":"figma-mcp-bridge"}`

---

## Step 6: Test the Integration

### Test 1: Check Health
```bash
curl https://YOUR-APP-NAME.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "figma-mcp-bridge",
  "version": "1.0.0"
}
```

### Test 2: Get Figma File Info
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  https://YOUR-APP-NAME.onrender.com/api/figma/file/YOUR_FILE_KEY
```

### Test 3: Update Image (from Writer Agent)
In Writer Agent:
```markdown
User: "Generate a hero image and inject it into my Figma template"

Agent will:
1. Call image_edit_or_generate
2. Get public URL for image
3. Call Figma bridge API with fileKey and nodeId
4. Return success
```

---

## Troubleshooting

### Issue: "Invalid API key"
**Solution**: 
- Re-run OAuth flow: `https://YOUR-APP-NAME.onrender.com/auth/figma`
- Get fresh API key
- Update in Writer AI Studio

### Issue: "Authentication failed" during OAuth
**Solution**:
- Check `FIGMA_CLIENT_ID` and `FIGMA_CLIENT_SECRET` in Render env vars
- Verify redirect URI matches exactly in Figma app settings
- Ensure BASE_URL is correct

### Issue: "Failed to update image"
**Solution**:
- Verify `fileKey` and `nodeId` are correct
- Check that node supports image fills (must be Rectangle/Frame)
- Ensure image URL is publicly accessible
- Try with a different node

### Issue: Service keeps restarting
**Solution**:
- Check Render logs for errors
- Verify all environment variables are set
- Check that node_modules installed correctly

### Issue: "Cannot find module"
**Solution**:
- Ensure `package.json` is correct
- Redeploy with "Clear build cache" enabled
- Check Node version (should be 18+)

---

## Monitoring & Logs

### View Logs on Render
1. Go to your service dashboard
2. Click "Logs" tab
3. See real-time logs and errors

### Check Service Status
- Health endpoint: `https://YOUR-APP-NAME.onrender.com/health`
- Should always return 200 OK

### Free Tier Limitations
- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Upgrade to paid tier for always-on service

---

## Security Best Practices

1. **Never commit .env file**
   - Already in `.gitignore`
   - Only set env vars on Render dashboard

2. **Rotate API keys regularly**
   - Re-run OAuth flow monthly
   - Update in Writer AI Studio

3. **Use HTTPS only**
   - Render provides HTTPS by default
   - Never use HTTP in production

4. **Monitor API usage**
   - Check Render analytics
   - Watch for unusual patterns

---

## Next Steps

After successful deployment:

1. **Create Figma Template**
   - Design your template in Figma
   - Name layers clearly (e.g., `hero_image`, `product_photo`)
   - Get File Key and Node IDs

2. **Test Workflow in Writer Agent**
   ```markdown
   "Generate a product image and update my Figma template"
   ```

3. **Automate!**
   - Create Writer Agent playbooks
   - Build automated pipelines
   - Generate content at scale

---

## Cost Estimate

- **Render Free Tier**: $0/month
  - 750 hours/month
  - Spins down after inactivity
  
- **Render Starter**: $7/month
  - Always on
  - Better performance
  
- **Figma MCP**: Free during beta
  - Will be usage-based later
  
**Total Cost**: $0-7/month

---

## Support

- **Render Issues**: https://render.com/docs
- **Figma MCP Docs**: https://developers.figma.com/docs/figma-mcp-server/
- **Writer AI Studio**: https://writer.com/docs/

---

## Quick Reference

**OAuth Flow**: `https://YOUR-APP.onrender.com/auth/figma`  
**Health Check**: `https://YOUR-APP.onrender.com/health`  
**Main Endpoint**: `POST https://YOUR-APP.onrender.com/api/figma/update-image`

**Headers Required**:
```
X-API-Key: your_api_key
Content-Type: application/json
```

**Example Request**:
```json
{
  "fileKey": "abc123",
  "nodeId": "1:2",
  "imageUrl": "https://example.com/image.jpg",
  "scaleMode": "FILL"
}
```

You're all set! 🚀