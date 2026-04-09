# Using Figma MCP Bridge with Writer Agent

Complete guide for using the Figma MCP Bridge from Writer Agent to automate image injection into Figma templates.

---

## Quick Start Workflow

The typical workflow:
1. User requests image generation + Figma injection
2. Writer Agent generates image using image_edit_or_generate
3. Agent gets public URL for generated image
4. Agent calls Figma MCP Bridge API to inject image
5. Agent exports final design (optional)
6. Agent delivers result to user

---

## Prerequisites

- ✅ Figma MCP Bridge deployed on Render
- ✅ OAuth completed, API key obtained
- ✅ Custom connector added to Writer AI Studio
- ✅ Figma template prepared with named layers

---

## Step 1: Prepare Your Figma Template

### Create Template in Figma

1. **Open Figma** and create a new file
2. **Design your template** (e.g., social media post, product card)
3. **Name your image layers clearly**:
   ```
   ✅ Good names:
   - hero_image
   - product_photo
   - background_image
   - user_avatar
   
   ❌ Bad names:
   - Rectangle 1
   - Layer
   - Image
   ```

4. **Get your File Key**:
   - From URL: `https://www.figma.com/file/ABC123/MyDesign`
   - File Key = `ABC123`

5. **Get Node IDs for your image layers**:
   - Select layer in Figma
   - Right-click → Copy/Paste → Copy as → Copy link
   - URL like: `https://www.figma.com/file/ABC123/Design?node-id=1:2`
   - Node ID = `1:2`

### Example Template Structure

```
📄 Social Media Post Template (File: abc123)
├── 🖼️ hero_image (Node: 1:2) ← Replace this
├── 📝 Title Text (Node: 1:3)
├── 📝 Caption Text (Node: 1:4)
└── 🎨 Background (Node: 1:5)
```

---

## Step 2: Use from Writer Agent

### Example 1: Simple Image Injection

**User Request:**
```
"Create a product launch image and add it to my Figma social media template"
```

**Writer Agent Steps:**

1. Generate image using image_edit_or_generate tool
2. Get the URL of the generated image (from workspace)
3. Call the FIGMA_MCP_BRIDGE custom connector
4. Use the update-image endpoint with:
   - fileKey: "your_figma_file_key"
   - nodeId: "1:2" (the hero_image layer)
   - imageUrl: URL to generated image
   - scaleMode: "FILL"

**Result:** Image is automatically injected into Figma template!

---

## Step 3: API Endpoint Reference

### Main Endpoint: Update Image

**Request:**
```http
POST /api/figma/update-image
X-API-Key: your_api_key
Content-Type: application/json

{
  "fileKey": "abc123xyz",
  "nodeId": "1:2",
  "imageUrl": "https://example.com/generated-image.jpg",
  "scaleMode": "FILL"
}
```

**Scale Modes:**
- `FILL` - Fill entire area (may crop) - **Best for photos**
- `FIT` - Fit inside (may show empty space) - **Best for logos**
- `CROP` - Crop to fill, maintain ratio
- `TILE` - Repeat image pattern

**Response:**
```json
{
  "success": true,
  "result": {
    "updated": true
  }
}
```

### Export Endpoint

**Request:**
```http
POST /api/figma/export
X-API-Key: your_api_key
Content-Type: application/json

{
  "fileKey": "abc123xyz",
  "nodeId": "1:2",
  "format": "PNG",
  "scale": 2
}
```

**Response:**
```json
{
  "images": {
    "1:2": "https://figma-export-url.com/image.png"
  }
}
```

---

## Common Use Cases

### Use Case 1: Social Media Content Generation

**Scenario:** Generate social media posts at scale

**User Request:**
```
"Create 5 Instagram posts about our new product launch"
```

**Workflow:**
1. Generate 5 different product images
2. For each image:
   - Inject into Instagram post template
   - Export as PNG
3. Deliver all 5 posts to user

---

### Use Case 2: Product Photography Updates

**Scenario:** Update product photos across multiple templates

**User Request:**
```
"Update all my product card templates with the new hero shot"
```

**Workflow:**
1. Generate or upload new product photo
2. Get list of template file keys
3. For each template:
   - Call update-image endpoint
   - Target product_photo node
4. Confirm all templates updated

---

### Use Case 3: Personalized Marketing Materials

**Scenario:** Create personalized designs for different customers

**User Request:**
```
"Create personalized welcome cards for our top 10 customers"
```

**Workflow:**
1. Get customer data (names, photos)
2. For each customer:
   - Generate custom image
   - Inject into welcome card template
   - Update text layers with customer name
   - Export final design
3. Deliver batch of personalized cards

---

## Advanced Features

### Batch Processing Multiple Images

```http
POST /api/figma/update-image (for each image)

Image 1:
{
  "fileKey": "abc123",
  "nodeId": "1:2",
  "imageUrl": "image1.jpg",
  "scaleMode": "FILL"
}

Image 2:
{
  "fileKey": "abc123",
  "nodeId": "1:3",
  "imageUrl": "image2.jpg",
  "scaleMode": "FIT"
}
```

### Dynamic Template Selection

```javascript
// Pseudo-code for Writer Agent logic
if (content_type === "social_media") {
  fileKey = "social_template_123"
  nodeId = "1:2"
} else if (content_type === "product_card") {
  fileKey = "product_template_456"
  nodeId = "2:5"
}
```

---

## Best Practices

### 1. Template Organization

- ✅ Use consistent naming across templates
- ✅ Group related layers
- ✅ Lock non-editable elements
- ✅ Document node IDs in a separate file

### 2. Image Quality

- ✅ Generate images at 2x size for retina displays
- ✅ Use appropriate formats (JPG for photos, PNG for graphics)
- ✅ Optimize images before upload
- ✅ Test different scale modes

### 3. Error Handling

- ✅ Verify file key and node ID exist
- ✅ Check image URLs are publicly accessible
- ✅ Handle rate limits gracefully
- ✅ Provide clear error messages to users

### 4. Performance

- ✅ Cache frequently used templates
- ✅ Use webhooks for async processing
- ✅ Batch similar requests
- ✅ Monitor API usage

---

## Troubleshooting

### Issue: "Failed to update image"

**Possible Causes:**
1. Node doesn't support image fills
   - Solution: Use Rectangle or Frame layers only
2. Image URL not accessible
   - Solution: Use publicly accessible URLs
3. Invalid file key or node ID
   - Solution: Verify IDs are correct

### Issue: "Image appears distorted"

**Solution:** Try different scale modes:
- Photos → `FILL`
- Logos → `FIT`
- Patterns → `TILE`

### Issue: "Rate limit exceeded"

**Solution:**
- Add delays between requests
- Use batch endpoints
- Upgrade Figma plan if needed

---

## Example Prompts for Writer Agent

### Simple Injection
```
"Generate a hero image and add it to my Figma template abc123, node 1:2"
```

### With Export
```
"Create a product photo, inject it into my Figma product card template, and export as PNG"
```

### Batch Processing
```
"Generate 10 different background images and update my landing page templates"
```

### Custom Requirements
```
"Create a minimalist product shot with blue tones, inject into my e-commerce template using FIT scale mode"
```

---

## Integration Checklist

Before going live:
- [ ] Figma templates created and tested
- [ ] Node IDs documented
- [ ] API key secured
- [ ] Writer Agent connector configured
- [ ] Test workflow end-to-end
- [ ] Error handling implemented
- [ ] Rate limits understood
- [ ] Backup plan for API failures

---

## API Limits & Quotas

**Figma MCP Server:**
- Check current limits: https://developers.figma.com/docs/figma-mcp-server/plans-access-and-permissions/
- Free during beta period
- Usage-based pricing coming later

**Render Free Tier:**
- 750 hours/month
- Spins down after 15 min inactivity
- First request after spin-down: ~30s delay

**Recommendations:**
- Monitor usage regularly
- Plan for paid tiers if scaling
- Implement caching where possible

---

## Next Steps

1. **Test Your First Injection**
   - Create simple template
   - Generate test image
   - Inject and verify

2. **Build Automation**
   - Create Writer Agent playbooks
   - Set up scheduled runs
   - Monitor success rates

3. **Scale Up**
   - Add more templates
   - Batch processing
   - Production deployment

---

## Support & Resources

- **Figma MCP Docs**: https://developers.figma.com/docs/figma-mcp-server/
- **Writer AI Studio**: https://writer.com/docs/
- **API Issues**: Check Render logs
- **Figma Community**: https://forum.figma.com/

---

Happy automating! 🚀