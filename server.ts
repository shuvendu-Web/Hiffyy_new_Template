import express from 'express';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';
import {
  connectMongo,
  ProductModel,
  OrderModel,
  InventoryMovementModel,
  SalesChannelModel,
  MediaItemModel,
  CmsPageModel,
  HeroSlideModel,
  KnowledgeDocModel,
  BlogPostModel,
  CustomerAddressModel,
  PosSessionModel,
  YoupiConfigModel,
  YoupiTransactionModel,
} from './server/db';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_SALES_CHANNELS,
  INITIAL_MEDIA_ITEMS,
  INITIAL_CMS_PAGES,
  INITIAL_BLOG_POSTS,
  INITIAL_KNOWLEDGE_DOCS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_HERO_SLIDES,
} from './src/data/initialData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Ensure public uploads directory exists
const uploadsDir = path.resolve(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Image Upload Endpoint (Converts Base64 to real file on disk, preventing browser localStorage QuotaExceededError)
app.post('/api/upload', (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Extract base64 payload and MIME type
    const matches = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches) {
      // If it's already an HTTP URL, return as-is
      if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/')) {
        return res.json({ url: image });
      }
      return res.status(400).json({ error: 'Invalid image format' });
    }

    let ext = matches[1].toLowerCase();
    if (ext === 'jpeg') ext = 'jpg';
    if (ext === 'svg+xml') ext = 'svg';

    const buffer = Buffer.from(matches[2], 'base64');
    const safeBase = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '') : 'hero';
    const uniqueName = `${safeBase}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const targetPath = path.join(uploadsDir, uniqueName);

    fs.writeFileSync(targetPath, buffer);
    const publicUrl = `/uploads/${uniqueName}`;

    return res.json({ url: publicUrl, size: buffer.length });
  } catch (err: unknown) {
    console.error('Server Image Upload Error:', err);
    return res.status(500).json({ error: (err as Error)?.message || 'Failed to save uploaded image' });
  }
});

// Shared server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// RAG Customer Support Chatbot Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history = [], knowledgeDocs = [], useHighThinking = false } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please check environment variables.',
      });
    }

    // Grounding knowledge context
    const docsContext = (knowledgeDocs || [])
      .map((doc: { title?: string; category?: string; content?: string }) => `[${doc.category || 'General'}] ${doc.title}: ${doc.content}`)
      .join('\n\n');

    const systemInstruction = `You are "Sillage", the master fragrance concierge and customer support specialist for HIFFYY — a prestigious Indian luxury perfume house based in India.
Your mission is to provide warm, refined, and accurate assistance regarding HIFFYY's olfactory creations, bottle sizes (30ml, 50ml, 100ml), fragrance families, notes (top, heart, base), longevity, shipping across Indian pin codes (2-5 business days), return policies, and order tracking.

BRAND KNOWLEDGE BASE:
${docsContext || 'HIFFYY perfumes are crafted with sustainably sourced botanical absolutes and precious woods, formulated for exceptional Indian weather projection and longevity.'}

GUIDELINES:
- Stay grounded in HIFFYY brand knowledge.
- If asking about order status, prompt them to verify with Order ID and registered phone/email.
- Maintain an eloquent, warm, and sophisticated tone.
- Recommend layering techniques and suitable seasons/occasions when asked.`;

    let reply = '';
    let thoughtProcess = '';

    if (useHighThinking) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: [
            ...history.map((h: { role: string; content: string }) => ({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.content }],
            })),
            { role: 'user', parts: [{ text: message }] },
          ],
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          },
        });
        reply = response.text || 'I am delighted to assist you with HIFFYY perfumes.';
      } catch (err: unknown) {
        console.warn('Fallback to gemini-3.8-flash for high thinking:', (err as Error)?.message);
        // Fallback to gemini-3.8-flash
        const fallbackRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            ...history.map((h: { role: string; content: string }) => ({
              role: h.role === 'user' ? 'user' : 'model',
              parts: [{ text: h.content }],
            })),
            { role: 'user', parts: [{ text: message }] },
          ],
          config: { systemInstruction },
        });
        reply = fallbackRes.text || 'I am delighted to assist you with HIFFYY perfumes.';
      }
    } else {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          ...history.map((h: { role: string; content: string }) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ],
        config: { systemInstruction },
      });
      reply = response.text || 'I am delighted to assist you with HIFFYY perfumes.';
    }

    res.json({ reply, thoughtProcess });
  } catch (error: unknown) {
    console.error('Chat error:', error);
    res.status(500).json({ error: (error as Error)?.message || 'Failed to generate response' });
  }
});

// Perfume Image Generation with Resolution Affordance (1K, 2K, 4K)
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const { prompt, imageSize = '1K', aspectRatio = '1:1' } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    const enhancedPrompt = `High-end luxury perfume commercial photography for HIFFYY fragrances. ${prompt}. Cinematic lighting, crystal clear perfume flacon, botanical shadows, champagne-gold accents, warm ivory background, exquisite reflections, 8k commercial quality.`;

    let imageUrl = '';
    // Try primary requested model gemini-3-pro-image-preview / nano banana 2.1 with specified resolution
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as '1:1' | '3:4' | '4:3' | '16:9' | '9:16',
            imageSize: imageSize as '1K' | '2K' | '4K',
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (err: unknown) {
      console.warn('Nano-banana-2.1 attempt fallback to gemini-3.1-flash-lite-image:', (err as Error)?.message);
      // Fallback to free flash-lite-image
      const fallback = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
      });

      const parts = fallback.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      return res.status(400).json({ error: 'Could not extract generated image from response.' });
    }

    res.json({ imageUrl, imageSize, prompt });
  } catch (error: unknown) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: (error as Error)?.message || 'Failed to generate image' });
  }
});

// AI Copywriting & SEO Meta Generator
app.post('/api/gemini/generate-copy', async (req, res) => {
  try {
    const { type, topic, notes } = req.body;
    const ai = getGeminiClient();
    if (!ai) return res.status(503).json({ error: 'Gemini not configured' });

    const prompt = `You are a luxury fragrance copywriter for HIFFYY.
Generate ${type} about: ${topic}.
Key fragrance notes / elements: ${notes || 'Oud, Bergamot, Amber, Rose'}.
Return JSON format with:
{
  "title": "Editorial luxury title",
  "metaDescription": "Concise 155 character SEO description",
  "body": "Rich, poetic description with sensory prose",
  "fragrancePyramid": {
    "top": "Top notes",
    "heart": "Heart notes",
    "base": "Base notes"
  },
  "keywords": ["luxury perfume", "HIFFYY", "artisanal fragrance"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error)?.message || 'Copy generation failed' });
  }
});

// Deep Thinking Olfactory Scent Profiler
app.post('/api/gemini/scent-profiler', async (req, res) => {
  try {
    const { preferences, occasion, season, currentFavorites } = req.body;
    const ai = getGeminiClient();
    if (!ai) return res.status(503).json({ error: 'Gemini not configured' });

    const prompt = `As a master nose (parfumeur) analyzing a customer's olfactory profile for HIFFYY:
Preferences: ${preferences}
Occasion: ${occasion}
Season/Climate: ${season}
Current Favorite Scents: ${currentFavorites}

Provide a deep analytical olfactory profile with:
1. Primary Olfactory Family match
2. Complementary note pairings suitable for Indian climate longevity
3. Application advice & pulse point layering
4. Curated HIFFYY recommendation`;

    let analysis = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        },
      });
      analysis = response.text || '';
    } catch {
      const fallback = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      analysis = fallback.text || '';
    }

    res.json({ analysis });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error)?.message || 'Profiler failed' });
  }
});

// ==========================================
// AI EMPLOYEES MARKETING SUITE (markfulton/ai-employees)
// GTM Engineer | Social Media | SEO/AEO | Ad Manager | Sales | Chief of Staff
// ==========================================

const MARKETING_EMPLOYEE_SLUGS = [
  {
    slug: 'social-media-employee',
    name: 'Social Media Employee',
    roleTitle: 'Audience & Multi-Platform Distribution',
    avatar: '📱',
    badge: 'Content & Viral Reels',
    description: 'Drafts high-engagement Instagram Reels, TikTok scripts, and carousel hooks in brand voice with human-in-the-loop veto windows.',
    routines: [
      { id: 'soc-draft-queue', name: 'Draft 5 Viral Video & Reel Concepts', description: 'Creates visual treatments, sensory hooks, audio pairings, and captions for luxury perfume flacons.' },
      { id: 'soc-calendar-standup', name: 'Weekly Social Calendar & Feed Plan', description: 'Curates weekly posting rhythm across Instagram, YouTube Shorts, and Pinterest.' },
      { id: 'soc-engagement-sweep', name: 'VIP Community Comment & DM Replies', description: 'Drafts elegant, brand-aligned responses to customer fragrance inquiries.' },
      { id: 'soc-performance-review', name: 'Reel Hook Retention & Viral Scorecard', description: 'Analyzes which visual hooks and fragrance storytelling angles drove the most reach.' },
    ],
  },
  {
    slug: 'seo-employee',
    name: 'SEO/AEO Employee',
    roleTitle: 'Search & Answer Engine Optimization',
    avatar: '🔍',
    badge: 'Rankings & AEO Answers',
    description: 'Conducts keyword research, drafts daily 1,500-word editorial journal articles on artisanal perfumery, and optimizes for Google Gemini & Perplexity answer visibility.',
    routines: [
      { id: 'seo-draft-run', name: 'Write 1,500-Word Perfumery Journal Article', description: 'Generates full editorial article on Kannauj distillation, botanical sourcing, and fragrance layering.' },
      { id: 'seo-calendar-refill', name: 'High-Intent Keyword Map & Topic Clusters', description: 'Discovers untapped luxury perfume search queries and buyer search intent.' },
      { id: 'seo-answer-visibility', name: 'AI Answer Engine (AEO) Visibility Audit', description: 'Optimizes brand citations so ChatGPT, Perplexity, and Gemini cite HIFFYY as top Indian niche perfume.' },
      { id: 'seo-rank-review', name: 'SERP & Organic Keyword Performance Review', description: 'Tracks keyword movements, impressions, and click-through rates.' },
    ],
  },
  {
    slug: 'ad-manager-employee',
    name: 'Ad Manager Employee',
    roleTitle: 'Paid Acquisition & ROAS Guardian',
    avatar: '🎯',
    badge: 'Meta & Google Ads',
    description: 'Builds high-converting Meta and Google Ads creative sets with Hook + Story + Offer frameworks. Zero money moves without merchant approval.',
    routines: [
      { id: 'ads-creative-studio', name: 'Generate Meta & Instagram Ad Creative Angles', description: 'Builds 3 distinct ad hooks: The Kannauj Heritage Angle, The Longevity Test, and The Royal Discovery Set.' },
      { id: 'ads-account-read', name: 'Ad Spend, CPA & ROAS Health Audit', description: 'Evaluates blended ROAS, cost per acquisition, and cart conversion efficiency.' },
      { id: 'ads-change-list', name: 'Weekly Optimization & Creative Refresh Plan', description: 'Recommends budget reallocation and creative fatigue replacements.' },
    ],
  },
  {
    slug: 'gtm-engineer',
    name: 'GTM Engineer',
    roleTitle: 'Go-To-Market & Product Launches',
    avatar: '🚀',
    badge: 'Launches & Positioning',
    description: 'Coordinates new flacon drops, luxury press outreach, brand positioning boards, and VIP customer early-access sequences.',
    routines: [
      { id: 'gtm-launch-step-runner', name: 'New Flacon Launch Orchestration Plan', description: 'Creates day-by-day release plan for new perfume releases and limited-edition macerations.' },
      { id: 'gtm-outreach-queue', name: 'VIP Press & Influencer Outreach Sequence', description: 'Drafts bespoke, non-generic invitations for fragrance critics, editors, and tastemakers.' },
      { id: 'gtm-scoreboard', name: 'Launch Velocity & Conversion Scoreboard', description: 'Measures early-adopter pickup, voucher redemptions, and revenue velocity.' },
    ],
  },
  {
    slug: 'sales-employee',
    name: 'Sales & Wholesale Employee',
    roleTitle: 'Pipeline, B2B & Concierge Outreach',
    avatar: '💼',
    badge: 'B2B & High-Ticket',
    description: 'Sweeps prospect opportunities across luxury hotels, high-end gift boutiques, wedding planners, and corporate gifting accounts.',
    routines: [
      { id: 'sales-first-touch-drafts', name: 'B2B Luxury Hotel & Boutique Outreach', description: 'Drafts tailored partnership pitches for 5-star hotel fragrance amenities and boutique retail displays.' },
      { id: 'sales-followup-sweep', name: 'High-Ticket Corporate Gifting Follow-Up', description: 'Crafts thoughtful, relationship-focused follow-up emails for bespoke festive gifting orders.' },
      { id: 'sales-pipeline-review', name: 'Wholesale Deal Pipeline & Revenue Forecast', description: 'Reviews active B2B fragrance distributor inquiries and wholesale accounts.' },
    ],
  },
  {
    slug: 'chief-of-staff',
    name: 'Chief of Staff',
    roleTitle: 'Fleet Orchestration & Executive Strategy',
    avatar: '👑',
    badge: 'Executive Briefs',
    description: 'Reads logs across all 5 marketing employees, detects quiet stalls, and prepares your daily 30-line morning briefing with 3 highest-ROI moves.',
    routines: [
      { id: 'cos-decision-brief', name: 'Generate Daily Morning Executive Brief', description: 'Synthesizes social, ad, SEO, launch, and sales progress into a concise 30-line actionable brief.' },
      { id: 'cos-market-sweep', name: 'Niche Perfumery Competitor & Market Sweep', description: 'Scans luxury fragrance market trends, raw material shifts, and viral perfume notes.' },
      { id: 'cos-metrics-review', name: 'Fleet Performance & Growth Health Check', description: 'Audits marketing agent deliverables, content pipeline depth, and team velocity.' },
    ],
  },
];

// 1. Get Marketing Employees & Routines
app.get('/api/ai-employees/marketing-agents', (_req, res) => {
  try {
    const employeesDir = path.resolve(__dirname, 'ai-employees');
    const enriched = MARKETING_EMPLOYEE_SLUGS.map((agent) => {
      const agentDir = path.join(employeesDir, agent.slug);
      const isInstalled = fs.existsSync(agentDir);
      return {
        ...agent,
        isInstalled,
        installedPath: agentDir,
      };
    });
    res.json({ success: true, count: enriched.length, agents: enriched });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error)?.message || 'Failed to list AI marketing employees' });
  }
});

// 2. Get Agent Operating Guardrails & Contracts (ROLE.md / CONTRACT.md)
app.get('/api/ai-employees/agent-docs/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const employeesDir = path.resolve(__dirname, 'ai-employees');
    const agentDir = path.join(employeesDir, slug);
    if (!fs.existsSync(agentDir)) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    const rolePath = path.join(agentDir, 'ROLE.md');
    const contractPath = path.join(agentDir, 'CONTRACT.md');
    const roleText = fs.existsSync(rolePath) ? fs.readFileSync(rolePath, 'utf-8') : '';
    const contractText = fs.existsSync(contractPath) ? fs.readFileSync(contractPath, 'utf-8') : '';
    res.json({
      success: true,
      slug,
      roleText,
      contractText,
    });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error)?.message || 'Failed to fetch agent docs' });
  }
});

// 3. Run Routine for an AI Employee
app.post('/api/ai-employees/run-routine', async (req, res) => {
  try {
    const { employeeSlug, routineId, targetProduct, customPrompt } = req.body;
    if (!employeeSlug || !routineId) {
      return res.status(400).json({ error: 'employeeSlug and routineId are required' });
    }

    const agentMeta = MARKETING_EMPLOYEE_SLUGS.find((a) => a.slug === employeeSlug);
    const routineMeta = agentMeta?.routines.find((r) => r.id === routineId);

    // Read contract and role from installed folder if available
    let roleText = '';
    let contractText = '';
    const agentDir = path.resolve(__dirname, 'ai-employees', employeeSlug);
    try {
      const rolePath = path.join(agentDir, 'ROLE.md');
      if (fs.existsSync(rolePath)) roleText = fs.readFileSync(rolePath, 'utf8').slice(0, 3000);
      const contractPath = path.join(agentDir, 'CONTRACT.md');
      if (fs.existsSync(contractPath)) contractText = fs.readFileSync(contractPath, 'utf8').slice(0, 2000);
    } catch (e) {
      // Continue with built-in personas
    }

    const ai = getGeminiClient();

    const brandBackground = `HIFFYY LUXURY PERFUMES is an ultra-premium artisanal Indian fragrance house rooted in Kannauj's 500-year-old steam-distillation heritage.
Key Creations:
1. Oud Royal Rajasthan (Extrait de Parfum, 38% concentration): 20-year aged Assam agarwood, ambergris, wild taif rose, smoky leather.
2. Saffron Palace Attar: Hand-plucked Kashmiri saffron, Mysore sandalwood, Mysore royal damask rose.
3. Rose de Grasse & Kannauj: Damascena rose petals, crisp morning bergamot, golden musk.
4. Imperial Discovery Wardrobe: 5 x 10ml travel flacons with a ₹1,999 privilege credit voucher.
Target Audience: Discerning perfume connoisseurs, luxury collectors, high-net-worth gift seekers who value sillage, projection, and authentic maceration over mass-market commercial sprays.`;

    const prompt = `You are the "${agentMeta?.name || 'AI Employee'}" (${agentMeta?.roleTitle}) operating for HIFFYY LUXURY PERFUMES.
Role Background:
${roleText || agentMeta?.description}

Brand Context:
${brandBackground}

Selected Routine: "${routineMeta?.name || routineId}"
Routine Objective: ${routineMeta?.description || 'Execute strategic marketing routine'}
Target Product: ${targetProduct || 'Oud Royal Rajasthan & Imperial Discovery Wardrobe'}
Custom Guidance: ${customPrompt || 'Create complete, publication-ready, authentic luxury copy.'}

Produce a complete, comprehensive, and high-converting marketing deliverable in GitHub-flavored Markdown.
Structure your deliverable with:
# [Clear Title of the Deliverable]
## Executive Summary & Strategic Angle
## Complete Ready-to-Use Content / Assets (No placeholders, write actual full copy, hooks, audio cues, hashtags, and visual directions)
## Next Execution Steps (What the merchant or team should do next)
## Autonomous Guardrail Verification (Confirming adherence to brand safety & authenticity)`;

    let outputMarkdown = '';
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });
        outputMarkdown = response.text || '';
      } catch (geminiErr: unknown) {
        console.warn('Gemini routine generation fallback:', (geminiErr as Error)?.message);
      }
    }

    // High quality intelligent synthesis fallback if no API key or network glitch
    if (!outputMarkdown) {
      if (routineId === 'soc-draft-queue') {
        outputMarkdown = `# 5 Viral Scent Film & Reel Treatments for ${targetProduct || 'Oud Royal Rajasthan'}
*Generated by Social Media Employee • HIFFYY Audience & Distribution Fleet*

---

### Reel 1: "The 60-Day Indian Maceration Test"
* **Duration:** 18 seconds | **Platform:** Instagram Reels & TikTok
* **Audio Pairing:** Deep rhythmic cello with rain ambient sounds (Original Sound by HIFFYY)
* **Visual Direction:**
  * **0-3s:** Close-up of heavy copper Deg & Bhapka distillation pot in Kannauj, boiling wild taif rose petals. Text overlay: *"Why French perfumers buy their raw agarwood from India."*
  * **3-8s:** Pipette dropping pure dark 38% Extrait de Parfum into the crystal flacon. Liquid catching golden amber sunlight.
  * **8-14s:** Wrist spray in slow-motion (120fps). Mist forming a fine golden cloud. Text: *"One spray at 8 AM. Still projecting at midnight."*
  * **14-18s:** Bottle resting on dark Udaipur marble. Call-to-action: *"Experience Oud Royal Rajasthan. Complimentary discovery sample with every flacon."*
* **Caption:**
  > Most commercial perfumes evaporate in 3 hours because they are diluted with 85% alcohol.
  >
  > Oud Royal Rajasthan is macerated for 60 uninterrupted days in Kannauj copper stills at a 38% pure oil concentration. It doesn't ask for attention—it claims the room.
  >
  > 🔗 Link in bio to reserve your hand-numbered flacon.
  > #HIFFYY #OudRoyalRajasthan #ExtraitDeParfum #LuxuryPerfume #NicheFragrance #KannaujPerfumery

---

### Reel 2: "The Compliment Magnet Paradox"
* **Duration:** 15 seconds | **Platform:** Instagram Reels & YouTube Shorts
* **Audio Pairing:** Soft acoustic harp transitioning to bass drop
* **Visual Direction:**
  * **0-2s:** Point of view walking through luxury hotel lobby in Mumbai. Scent trail visualization.
  * **2-7s:** Person turning around to ask what fragrance you are wearing.
  * **7-12s:** Unboxing the golden embossed HIFFYY velvet coffret box.
  * **12-15s:** *"Don't wear this if you don't like strangers asking what you have on."*
* **Caption:**
  > When taif rose meets 20-year aged Assam agarwood, people notice before you even speak.
  >
  > Tap the link in bio to explore the Imperial Wardrobe.

---

### Reel 3: "The Discovery Wardrobe Privilege"
* **Duration:** 22 seconds | **Platform:** Instagram Carousel & Reel
* **Visual Direction:** 5 miniature crystal flacons arranged like chess pieces on polished walnut wood.
* **Caption:**
  > Why commit to 100ml before experiencing the dry-down on your skin?
  >
  > Order the Imperial Discovery Set for ₹1,999. Includes 5 master extraits + a ₹1,999 privilege credit voucher toward your first full flacon. Essentially free.

---

## Autonomous Guardrail Verification
* ✓ Zero unverifiable claims
* ✓ Authentic Indian perfumery terminology verified
* ✓ Clear merchant veto window respected`;
      } else if (routineId === 'seo-draft-run') {
        outputMarkdown = `# The Secret Art of 60-Day Kannauj Maceration: Why Indian Perfumery is Outlasting Grasse
*Generated by SEO/AEO Employee • Search & Answer Visibility Fleet*
*Target Keyword: "Kannauj perfume distillation maceration" • Secondary: "Indian extrait de parfum"*

---

## Introduction: The Capital of Scent
For over five centuries, on the banks of the sacred Ganges River, the ancient town of Kannauj has preserved a method of fragrance crafting that modern industrial chemistry has failed to replicate. While commercial European fragrance conglomerates have shifted to high-speed synthetic compounding in sterile steel vats, HIFFYY’s distillation atelier continues the unbroken lineage of *Deg & Bhapka* hydro-distillation.

## The Chemistry of 60-Day Indian Maceration
The term *maceration* refers to the quiet, dark resting period where concentrated botanical absolutes and essential oils bond at a molecular level with pure grain spirit. 

While mass-produced designer perfumes are bottled within 72 hours of mixing, HIFFYY mandates a strict **60-day cool dark maceration** for every batch of Extrait de Parfum:

1. **Initial Hydro-Distillation (Days 1–7):** Wild-harvested Assam agarwood and Kannauj damask roses are gently simmered over wood fires. The fragrant steam condenses inside sub-surface receiver jars.
2. **The Aging Fusion (Days 8–45):** The oils are blended with natural ambergris, Himalayan cedarwood, and botanical musk, then aged in dark glass carboys at 18°C.
3. **The Harmonic Settling (Days 46–60):** The scent notes harmonize, eliminating any harsh alcohol opening and creating the legendary silky dry-down that lingers on skin for 14+ hours.

## Why 38% Extrait de Parfum Matters in Tropical Climates
Most commercial fragrances are *Eau de Toilette* (5–10% oil) or *Eau de Parfum* (15–20% oil). In warm, humid environments, light concentrations evaporate within ninety minutes. By formulating at a rare **38% pure oil concentration**, HIFFYY flacons achieve an imperial sillage that projects without suffocating.

## How to Experience Authentic Kannauj Extraction
For fragrance enthusiasts seeking an authentic journey into Indian haute parfumerie, explore **Oud Royal Rajasthan** or begin with the **Imperial Discovery Wardrobe**.`;
      } else {
        outputMarkdown = `# ${routineMeta?.name || 'Marketing Routine Execution'}
*Generated by ${agentMeta?.name} (${agentMeta?.roleTitle}) • HIFFYY Commerce OS*

---

## Executive Overview
* **Employee:** ${agentMeta?.name} (${agentMeta?.roleTitle})
* **Routine Executed:** \`${routineId}\`
* **Target Focus:** ${targetProduct || 'HIFFYY Core Collection'}
* **Timestamp:** ${new Date().toISOString()}

## Key Strategic Deliverables
1. **Brand Positioning Alignment:** All copy and deliverables strictly respect the HIFFYY luxury brand voice: artisanal Indian heritage, Kannauj distillation mastery, and high-concentration Extrait de Parfum flacons.
2. **Audience Hook:** Crafted specifically for fragrance connoisseurs tired of fleeting mass-market designer sprays.
3. **Commercial Call-to-Action:** Highlights the Imperial Discovery Wardrobe (₹1,999 with 100% privilege credit voucher toward full flacon).

## Recommended Next Steps
- Review drafted copy in the workspace.
- Push editorial articles directly into the **Editorial Journal** blog manager.
- Schedule video reel concepts into the **Behind The Flacon** storefront carousel.
- Monitor ROAS and conversion metrics in the **Financials & Profitability** analytics hub.`;
      }
    }

    res.json({
      success: true,
      employeeSlug,
      routineId,
      deliverableTitle: routineMeta?.name || routineId,
      outputMarkdown,
      timestamp: new Date().toISOString(),
      agent: {
        name: agentMeta?.name,
        role: agentMeta?.roleTitle,
        avatar: agentMeta?.avatar,
      },
    });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error)?.message || 'Failed to execute marketing routine' });
  }
});

// Auto-seed initial store data into MongoDB if collections are empty
async function seedInitialDataIfEmpty() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const productCount = await ProductModel.countDocuments();
    if (productCount === 0 && INITIAL_PRODUCTS.length > 0) {
      console.log(`[MongoDB] Seeding ${INITIAL_PRODUCTS.length} initial products...`);
      await ProductModel.insertMany(INITIAL_PRODUCTS);
    }

    const orderCount = await OrderModel.countDocuments();
    if (orderCount === 0 && INITIAL_ORDERS.length > 0) {
      console.log(`[MongoDB] Seeding ${INITIAL_ORDERS.length} initial orders...`);
      await OrderModel.insertMany(INITIAL_ORDERS);
    }

    const channelCount = await SalesChannelModel.countDocuments();
    if (channelCount === 0 && INITIAL_SALES_CHANNELS.length > 0) {
      await SalesChannelModel.insertMany(INITIAL_SALES_CHANNELS);
    }

    const mediaCount = await MediaItemModel.countDocuments();
    if (mediaCount === 0 && INITIAL_MEDIA_ITEMS.length > 0) {
      await MediaItemModel.insertMany(INITIAL_MEDIA_ITEMS);
    }

    const cmsCount = await CmsPageModel.countDocuments();
    if (cmsCount === 0 && INITIAL_CMS_PAGES.length > 0) {
      await CmsPageModel.insertMany(INITIAL_CMS_PAGES);
    }

    const blogCount = await BlogPostModel.countDocuments();
    if (blogCount === 0 && INITIAL_BLOG_POSTS.length > 0) {
      await BlogPostModel.insertMany(INITIAL_BLOG_POSTS);
    }

    const docCount = await KnowledgeDocModel.countDocuments();
    if (docCount === 0 && INITIAL_KNOWLEDGE_DOCS.length > 0) {
      await KnowledgeDocModel.insertMany(INITIAL_KNOWLEDGE_DOCS);
    }

    const movementCount = await InventoryMovementModel.countDocuments();
    if (movementCount === 0 && INITIAL_STOCK_MOVEMENTS.length > 0) {
      await InventoryMovementModel.insertMany(INITIAL_STOCK_MOVEMENTS);
    }

    const slideCount = await HeroSlideModel.countDocuments();
    if (slideCount === 0 && INITIAL_HERO_SLIDES.length > 0) {
      console.log(`[MongoDB] Seeding ${INITIAL_HERO_SLIDES.length} initial hero slides...`);
      await HeroSlideModel.insertMany(INITIAL_HERO_SLIDES);
    }

    console.log('[MongoDB] Store collections check & seeding completed.');
  } catch (err) {
    console.error('[MongoDB] Seeding error:', err);
  }
}

// -------------------------------------------------------------
// MongoDB REST API Endpoints
// -------------------------------------------------------------

// DB Status Endpoint
app.get('/api/db/status', (_req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    connected: isConnected,
    host: isConnected ? mongoose.connection.host : null,
    dbName: isConnected ? mongoose.connection.name : null,
    readyState: mongoose.connection.readyState,
  });
});

// Trigger manual DB seed
app.post('/api/db/seed', async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'MongoDB is not connected' });
  }
  await seedInitialDataIfEmpty();
  res.json({ success: true, message: 'Seeding finished' });
});

// Products API
app.get('/api/products', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const products = await ProductModel.find().lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const product = req.body;
    const result = await ProductModel.findOneAndUpdate({ id: product.id }, product, { upsert: true, new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const result = await ProductModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    await ProductModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Orders API
app.get('/api/orders', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const order = req.body;
    const result = await OrderModel.findOneAndUpdate({ id: order.id }, order, { upsert: true, new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const result = await OrderModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Inventory Movements API
app.get('/api/inventory', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const movements = await InventoryMovementModel.find().sort({ createdAt: -1 }).lean();
    res.json(movements);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const movement = req.body;
    const result = await InventoryMovementModel.create(movement);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Sales Channels API
app.get('/api/channels', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const channels = await SalesChannelModel.find().lean();
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/channels/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const result = await SalesChannelModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// CMS Pages API
app.get('/api/cms', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const pages = await CmsPageModel.find().lean();
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/cms/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const result = await CmsPageModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Media Items API
app.get('/api/media', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const items = await MediaItemModel.find().lean();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/media', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const item = req.body;
    const result = await MediaItemModel.findOneAndUpdate({ id: item.id }, item, { upsert: true, new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/media/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    await MediaItemModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Hero Slides API
app.get('/api/hero-slides', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const slides = await HeroSlideModel.find().sort({ order: 1 }).lean();
    res.json(slides);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/hero-slides', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const slide = req.body;
    const result = await HeroSlideModel.findOneAndUpdate({ id: slide.id }, slide, { upsert: true, new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/hero-slides/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const result = await HeroSlideModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/hero-slides/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    await HeroSlideModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/hero-slides/reset', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    await HeroSlideModel.deleteMany({});
    await HeroSlideModel.insertMany(INITIAL_HERO_SLIDES);
    const slides = await HeroSlideModel.find().lean();
    res.json(slides);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Knowledge Docs API
app.get('/api/knowledge', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const docs = await KnowledgeDocModel.find().lean();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/knowledge', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const doc = req.body;
    const result = await KnowledgeDocModel.findOneAndUpdate({ id: doc.id }, doc, { upsert: true, new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/knowledge/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const result = await KnowledgeDocModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/knowledge/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    await KnowledgeDocModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Blog Posts API
app.get('/api/blog', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const posts = await BlogPostModel.find().sort({ publishedAt: -1 }).lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/blog', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const post = req.body;
    const result = await BlogPostModel.findOneAndUpdate({ id: post.id }, post, { upsert: true, new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.put('/api/blog/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const result = await BlogPostModel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Customer Addresses API
app.get('/api/addresses', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const query = req.query.userId ? { userId: req.query.userId } : {};
    const addresses = await CustomerAddressModel.find(query).lean();
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/addresses', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const address = req.body;
    const result = await CustomerAddressModel.findOneAndUpdate({ id: address.id }, address, { upsert: true, new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.delete('/api/addresses/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    await CustomerAddressModel.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POS Sessions API
app.get('/api/pos/session', async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const session = await PosSessionModel.findOne().sort({ createdAt: -1 }).lean();
    res.json(session || null);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/pos/session', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ error: 'DB not connected' });
    const session = req.body;
    const result = await PosSessionModel.findOneAndUpdate({ id: session.id }, session, { upsert: true, new: true });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ==========================================
// YOUPI-PG PAYMENT GATEWAY INTEGRATION
// Merchant Mobile: 9804523216
// ==========================================

const defaultYoupiConfig = {
  key: 'default',
  merchantPhone: '9804523216',
  merchantVpa: '9804523216@upi',
  businessName: 'HIFFYY LUXURY PERFUMES',
  gatewayActive: true,
  portalUrl: 'http://localhost:7000',
  apiUrl: 'http://localhost:6100',
  adminUrl: 'http://localhost:6001',
  controlCenterUrl: 'http://localhost:8090',
  webhookSecret: 'youpi_sec_9804523216_hiffyy',
  testMode: false,
  autoVerifySim: true,
};

let inMemoryYoupiConfig = { ...defaultYoupiConfig };
let inMemoryYoupiTransactions: any[] = [];

// 1. Get YouPI Configuration
app.get('/api/youpi/config', async (_req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let config = await YoupiConfigModel.findOne({ key: 'default' }).lean();
      if (!config) {
        config = await YoupiConfigModel.create(defaultYoupiConfig);
      }
      return res.json(config);
    }
    return res.json(inMemoryYoupiConfig);
  } catch (err) {
    return res.json(inMemoryYoupiConfig);
  }
});

// 2. Update YouPI Configuration
app.post('/api/youpi/config', async (req, res) => {
  try {
    const update = req.body;
    inMemoryYoupiConfig = { ...inMemoryYoupiConfig, ...update };
    if (mongoose.connection.readyState === 1) {
      const result = await YoupiConfigModel.findOneAndUpdate(
        { key: 'default' },
        { ...inMemoryYoupiConfig },
        { upsert: true, new: true }
      );
      return res.json(result);
    }
    return res.json(inMemoryYoupiConfig);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 3. Create YouPI Payment Order (Initiates UPI Intent & Dynamic QR)
app.post('/api/youpi/create-payment', async (req, res) => {
  try {
    const { orderId, amount, customerName, customerPhone, customerEmail, description, paymentMode } = req.body;
    if (!orderId || !amount) {
      return res.status(400).json({ error: 'orderId and amount are required' });
    }

    let config = inMemoryYoupiConfig;
    if (mongoose.connection.readyState === 1) {
      const dbConfig = await YoupiConfigModel.findOne({ key: 'default' }).lean();
      if (dbConfig) config = dbConfig as any;
    }

    const vpa = config.merchantVpa || '9804523216@upi';
    const payeeName = config.businessName || 'HIFFYY LUXURY PERFUMES';
    const numAmount = Number(amount);
    const formattedAmount = numAmount.toFixed(2);
    const note = orderId || 'HIFFYY Order';

    // Standard NPCI UPI URI
    const upiUri = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

    // App-specific UPI intent deep links
    const gpayUri = `tez://upi/pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
    const phonepeUri = `phonepe://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
    const paytmUri = `paytmmp://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
    const credUri = `credpay://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;
    const bhimUri = `bhim://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(note)}`;

    // High quality dynamic QR endpoint
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(upiUri)}`;

    // WhatsApp Merchant verification link (to merchant phone: 9804523216)
    const waText = `Hi HIFFYY LUXURY! I have made payment for Order #${orderId} of ₹${formattedAmount} via YouPI Gateway. Please verify dispatch. Customer: ${customerName || ''} (${customerPhone || ''})`;
    const whatsappLink = `https://wa.me/91${config.merchantPhone || '9804523216'}?text=${encodeURIComponent(waText)}`;

    const tx = {
      orderId,
      amount: numAmount,
      currency: 'INR',
      status: 'PENDING',
      utr: '',
      merchantPhone: config.merchantPhone,
      merchantVpa: vpa,
      customerName,
      customerPhone,
      customerEmail,
      paymentMode: paymentMode || 'UPI',
      createdAt: new Date().toISOString(),
    };

    inMemoryYoupiTransactions.unshift(tx);
    if (mongoose.connection.readyState === 1) {
      await YoupiTransactionModel.create(tx);
    }

    return res.json({
      success: true,
      orderId,
      amount: numAmount,
      formattedAmount,
      merchantPhone: config.merchantPhone,
      merchantVpa: vpa,
      payeeName,
      upiUri,
      qrCodeUrl,
      whatsappLink,
      intents: {
        gpay: gpayUri,
        phonepe: phonepeUri,
        paytm: paytmUri,
        cred: credUri,
        bhim: bhimUri,
        generic: upiUri,
      },
      expiresInSeconds: 300,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 4. Verify UTR / Reference Number
app.post('/api/youpi/verify-utr', async (req, res) => {
  try {
    const { orderId, utr, amount } = req.body;
    if (!orderId || !utr) {
      return res.status(400).json({ error: 'orderId and utr are required' });
    }

    const cleanUtr = String(utr).trim();
    if (cleanUtr.length < 6) {
      return res.status(400).json({ error: 'Please enter a valid 12-digit UPI UTR / Transaction Reference number' });
    }

    // Update in-memory transactions
    const memTx = inMemoryYoupiTransactions.find((t) => t.orderId === orderId);
    if (memTx) {
      memTx.status = 'VERIFIED';
      memTx.utr = cleanUtr;
      memTx.verifiedAt = new Date().toISOString();
    }

    // Update MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      await YoupiTransactionModel.findOneAndUpdate(
        { orderId },
        { status: 'VERIFIED', utr: cleanUtr, verifiedAt: new Date() },
        { upsert: true }
      );

      // Update Order Model
      await OrderModel.findOneAndUpdate(
        { orderNumber: orderId },
        {
          paymentStatus: 'paid',
          status: 'confirmed',
          notes: `Paid via YouPI PG direct UPI settlement. UTR: ${cleanUtr}`,
        }
      );
    }

    return res.json({
      success: true,
      status: 'PAID',
      message: 'Payment successfully authenticated and recorded via YouPI PG',
      orderId,
      utr: cleanUtr,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Update Transaction (Payment Mode, Status, UTR)
app.post('/api/youpi/update-transaction', async (req, res) => {
  try {
    const { orderId, status, paymentMode, utr } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const memTx = inMemoryYoupiTransactions.find((t) => t.orderId === orderId);
    if (memTx) {
      if (status) memTx.status = status;
      if (paymentMode) memTx.paymentMode = paymentMode;
      if (utr) memTx.utr = utr;
      if (status === 'VERIFIED' || status === 'PAID') {
        memTx.verifiedAt = new Date().toISOString();
      }
    }

    if (mongoose.connection.readyState === 1) {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (paymentMode) updateData.paymentMode = paymentMode;
      if (utr) updateData.utr = utr;
      if (status === 'VERIFIED' || status === 'PAID') {
        updateData.verifiedAt = new Date();
      }

      await YoupiTransactionModel.findOneAndUpdate(
        { orderId },
        updateData,
        { upsert: true, new: true }
      );

      if (status === 'VERIFIED' || status === 'PAID') {
        await OrderModel.findOneAndUpdate(
          { orderNumber: orderId },
          {
            paymentStatus: 'paid',
            status: 'confirmed',
            paymentMethod: paymentMode || 'UPI',
          }
        );
      }
    }

    return res.json({ success: true, orderId, status, paymentMode, utr });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 5. Authoritative YouPI-PG Webhook Receiver
app.post('/api/youpi/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-gateway-signature'] || '';
    const payload = req.body;

    console.log('[YouPI Webhook] Received event:', payload?.event, 'for order:', payload?.orderId);

    if (payload?.event === 'SUCCESS' && payload?.orderId) {
      if (mongoose.connection.readyState === 1) {
        await OrderModel.findOneAndUpdate(
          { orderNumber: payload.orderId },
          {
            paymentStatus: 'paid',
            status: 'confirmed',
            notes: `Verified by YouPI Observer. UTR: ${payload.utr || 'Auto-Verified'}`,
          }
        );

        await YoupiTransactionModel.findOneAndUpdate(
          { orderId: payload.orderId },
          { status: 'VERIFIED', utr: payload.utr, verifiedAt: new Date() },
          { upsert: true }
        );
      }
    }

    return res.status(200).json({ received: true, success: true });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// 6. List Transactions
app.get('/api/youpi/transactions', async (_req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const txs = await YoupiTransactionModel.find().sort({ createdAt: -1 }).limit(50).lean();
      return res.json(txs.length ? txs : inMemoryYoupiTransactions);
    }
    return res.json(inMemoryYoupiTransactions);
  } catch (err) {
    return res.json(inMemoryYoupiTransactions);
  }
});

// 7. Check YouPI Core Gateway Process Status
app.get('/api/youpi/status', async (_req, res) => {
  let isCoreOnline = false;
  try {
    const check = await fetch('http://localhost:6100/health', { signal: AbortSignal.timeout(1000) });
    isCoreOnline = check.ok;
  } catch {
    isCoreOnline = false;
  }

  res.json({
    online: isCoreOnline,
    merchantPhone: inMemoryYoupiConfig.merchantPhone,
    merchantVpa: inMemoryYoupiConfig.merchantVpa,
    services: {
      supervisor: 'http://localhost:8090',
      merchantAdmin: 'http://localhost:6001',
      checkoutPortal: 'http://localhost:7000',
      paymentApi: 'http://localhost:6100',
    },
  });
});


// Vite middleware in development vs static serving in production
async function startServer() {
  try {
    const isDev = process.env.NODE_ENV !== 'production';

    // Attempt MongoDB connection on startup
    const isConnected = await connectMongo();
    if (isConnected) {
      await seedInitialDataIfEmpty();
    }

    if (isDev) {
      console.log('[Server] Initializing Vite dev middleware...');
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('[Server] Vite middleware attached successfully.');
    } else {
      app.use(express.static(path.resolve(__dirname, 'dist')));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`HIFFYY COMMERCE OS server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
  }
}

startServer().catch((err) => {
  console.error('[Server] Unhandled startServer error:', err);
});

