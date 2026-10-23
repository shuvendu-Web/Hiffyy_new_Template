import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  Play,
  Copy,
  Check,
  FileText,
  Film,
  Send,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCircle2,
  X,
  Target,
  Share2,
  Zap,
} from 'lucide-react';

interface RoutineMeta {
  id: string;
  name: string;
  description: string;
}

interface MarketingAgent {
  slug: string;
  name: string;
  roleTitle: string;
  avatar: string;
  badge: string;
  description: string;
  isInstalled: boolean;
  installedPath: string;
  routines: RoutineMeta[];
}

interface RoutineResult {
  success: boolean;
  employeeSlug: string;
  routineId: string;
  deliverableTitle: string;
  outputMarkdown: string;
  timestamp: string;
  agent?: {
    name: string;
    role: string;
    avatar: string;
  };
}

export const AiMarketingEmployeesManager: React.FC = () => {
  const { products, addBlogPost, addMediaItem, setAdminTab } = useStore();

  const [agents, setAgents] = useState<MarketingAgent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [selectedAgentSlug, setSelectedAgentSlug] = useState<string>('social-media-employee');
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>('soc-draft-queue');
  const [targetProduct, setTargetProduct] = useState<string>('Oud Royal Rajasthan');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  
  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<RoutineResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);

  // Contract & Role drawer inspection state
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorDocs, setInspectorDocs] = useState<{ roleText: string; contractText: string } | null>(null);
  const [inspectorLoading, setInspectorLoading] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<'contract' | 'role'>('contract');

  // Load agents on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const res = await fetch('/api/ai-employees/marketing-agents');
      const data = await res.json();
      if (data.agents && Array.isArray(data.agents)) {
        setAgents(data.agents);
        if (data.agents.length > 0 && !selectedAgentSlug) {
          setSelectedAgentSlug(data.agents[0].slug);
          setSelectedRoutineId(data.agents[0].routines[0]?.id || '');
        }
      }
    } catch (err) {
      console.error('Failed to load marketing agents:', err);
    } finally {
      setLoadingAgents(false);
    }
  };

  const selectedAgent = agents.find((a) => a.slug === selectedAgentSlug) || agents[0];

  const handleSelectAgent = (slug: string) => {
    setSelectedAgentSlug(slug);
    const agent = agents.find((a) => a.slug === slug);
    if (agent && agent.routines.length > 0) {
      setSelectedRoutineId(agent.routines[0].id);
    }
  };

  const handleRunRoutine = async (agentSlugToRun?: string, routineIdToRun?: string) => {
    const slug = agentSlugToRun || selectedAgentSlug;
    const routine = routineIdToRun || selectedRoutineId;

    setIsExecuting(true);
    setErrorMsg(null);
    setPublishSuccessMsg(null);

    try {
      const response = await fetch('/api/ai-employees/run-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeSlug: slug,
          routineId: routine,
          targetProduct: targetProduct || 'HIFFYY Signature Flacon',
          customPrompt: customPrompt.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json();
        throw new Error(errorJson.error || 'Routine execution failed');
      }

      const data: RoutineResult = await response.json();
      setResult(data);
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Routine execution encountered an error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleInspectDocs = async (slug: string) => {
    setInspectorOpen(true);
    setInspectorLoading(true);
    try {
      const res = await fetch(`/api/ai-employees/agent-docs/${slug}`);
      const data = await res.json();
      setInspectorDocs({
        roleText: data.roleText || 'No ROLE.md found.',
        contractText: data.contractText || 'No CONTRACT.md found.',
      });
    } catch (err) {
      console.error('Failed to inspect agent docs:', err);
    } finally {
      setInspectorLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.outputMarkdown) return;
    navigator.clipboard.writeText(result.outputMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePublishToJournal = () => {
    if (!result?.outputMarkdown) return;

    // Extract title from deliverable
    const firstLineMatch = result.outputMarkdown.match(/^#\s+(.+)$/m);
    const title = firstLineMatch ? firstLineMatch[1].replace(/[*#]/g, '').trim() : result.deliverableTitle;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // First 200 chars for excerpt
    const plainText = result.outputMarkdown.replace(/[#*`>]/g, ' ').replace(/\s+/g, ' ').trim();
    const excerpt = plainText.slice(0, 190) + '...';

    addBlogPost({
      title,
      slug,
      category: 'Artisanal Perfumery & Heritage',
      excerpt,
      content: result.outputMarkdown,
      featuredImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80',
      author: `${result.agent?.name || 'SEO & Editorial AI'} • HIFFYY Atelier`,
      status: 'published',
      publishedAt: new Date().toISOString(),
      readTime: '6 min read',
    });

    setPublishSuccessMsg('Successfully published to Storefront Editorial Journal! Accessible in Journal & Blog.');
    setTimeout(() => setPublishSuccessMsg(null), 4000);
  };

  const handlePublishToReels = () => {
    if (!result?.outputMarkdown) return;

    // Add to Behind The Flacon Media Carousel
    addMediaItem({
      type: 'video',
      title: result.deliverableTitle || 'Artisanal Kannauj Scent Film',
      caption: `Autonomous marketing asset produced by ${result.agent?.name || 'Social Media Employee'} for ${targetProduct}.`,
      mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-perfume-bottle-in-a-golden-light-41553-large.mp4',
      embedId: `ai-reel-${Date.now()}`,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-perfume-bottle-in-a-golden-light-41553-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      ctaLabel: 'Reserve Flacon',
      ctaLink: '/products/oud-royal-rajasthan',
      displayOrder: 1,
      isActive: true,
      placement: 'homepage_carousel',
      duration: '0:18',
    });

    setPublishSuccessMsg('Successfully published to Storefront "Behind The Flacon & Scent Films" Video Carousel!');
    setTimeout(() => setPublishSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Luxury Banner */}
      <div className="bg-[#12231A] text-[#FAF8F5] p-6 border border-[#182F23] relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#182F23] border border-[#C5A880]/50 text-[#DFCAAB] text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center gap-1.5">
                <Bot className="w-3 h-3 text-[#C5A880]" />
                MARKFULTON/AI-EMPLOYEES
              </span>
              <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono tracking-wider uppercase font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                6 Agents Installed
              </span>
            </div>

            <h1 className="text-2xl font-serif font-bold tracking-wide text-white">
              Autonomous Marketing & Growth Fleet
            </h1>
            <p className="text-xs text-[#DFCAAB]/80 leading-relaxed">
              Six dedicated AI employees running specialized growth, distribution, search, and wholesale routines.
              Each operates under sovereign contracts with strict guardrails: zero unsupervised ad spend, human-in-the-loop veto windows, and 100% adherence to authentic Kannauj distillation craft.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setSelectedAgentSlug('chief-of-staff');
                setSelectedRoutineId('cos-decision-brief');
                handleRunRoutine('chief-of-staff', 'cos-decision-brief');
              }}
              disabled={isExecuting}
              className="px-4 py-2.5 bg-[#C5A880] text-[#12231A] hover:bg-[#DFCAAB] text-xs font-semibold tracking-wider uppercase transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-current" />
              Daily Morning Executive Brief
            </button>
            <button
              onClick={() => fetchAgents()}
              className="px-3 py-2.5 bg-[#182F23] hover:bg-[#182F23]/80 border border-[#C5A880]/30 text-[#DFCAAB] text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              title="Refresh Fleet Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAgents ? 'animate-spin' : ''}`} />
              Fleet Health
            </button>
          </div>
        </div>

        {/* Fleet Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[#182F23]/80 text-xs">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#C5A880]">Active Employees</div>
            <div className="text-base font-serif font-bold text-white mt-0.5">6 Core Roles</div>
            <div className="text-[10px] text-[#DFCAAB]/60">Social, SEO, Ads, GTM, Sales, CoS</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#C5A880]">Routine Capabilities</div>
            <div className="text-base font-serif font-bold text-white mt-0.5">20 Execution Routines</div>
            <div className="text-[10px] text-[#DFCAAB]/60">Self-testing & autonomous drafting</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#C5A880]">Brand Alignment</div>
            <div className="text-base font-serif font-bold text-white mt-0.5">Kannauj Heritage</div>
            <div className="text-[10px] text-[#DFCAAB]/60">38% Extrait de Parfum grounding</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#C5A880]">Safety Guardrails</div>
            <div className="text-base font-serif font-bold text-white mt-0.5">100% Veto Windows</div>
            <div className="text-[10px] text-[#DFCAAB]/60">Zero budget drift without approval</div>
          </div>
        </div>
      </div>

      {/* 6 AI Employees Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-[#12231A] flex items-center gap-2">
            <span>Select Marketing Employee to Inspect or Command</span>
          </h2>
          <span className="text-[11px] text-[#12231A]/60">
            Click any employee card to configure their routines
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const isSelected = selectedAgentSlug === agent.slug;
            return (
              <div
                key={agent.slug}
                onClick={() => handleSelectAgent(agent.slug)}
                className={`p-4 border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#182F23] text-[#FAF8F5] border-[#C5A880] shadow-lg ring-1 ring-[#C5A880]'
                    : 'bg-white text-[#12231A] border-[#C5A880]/30 hover:border-[#C5A880] hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 bg-[#F4EFE6]/20 rounded-md">{agent.avatar}</span>
                      <div>
                        <h3 className={`font-serif font-bold text-sm ${isSelected ? 'text-white' : 'text-[#12231A]'}`}>
                          {agent.name}
                        </h3>
                        <p className={`text-[11px] font-mono ${isSelected ? 'text-[#C5A880]' : 'text-[#8C6D46]'}`}>
                          {agent.roleTitle}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase font-semibold border ${
                        isSelected
                          ? 'bg-[#12231A] text-[#DFCAAB] border-[#C5A880]/50'
                          : 'bg-[#F4EFE6] text-[#12231A] border-[#C5A880]/30'
                      }`}
                    >
                      {agent.badge}
                    </span>
                  </div>

                  <p className={`text-xs mt-2 leading-relaxed ${isSelected ? 'text-[#DFCAAB]/90' : 'text-[#4A5568]'}`}>
                    {agent.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-current/10 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{agent.routines.length} Routines Ready</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInspectDocs(agent.slug);
                    }}
                    className={`underline hover:text-[#C5A880] text-[10px] font-mono flex items-center gap-1 cursor-pointer`}
                  >
                    <Eye className="w-3 h-3" />
                    View Contract
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Routine Execution Command Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Routine Control Panel (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 border border-[#C5A880]/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#C5A880]/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedAgent?.avatar}</span>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#12231A]">
                    {selectedAgent?.name} Console
                  </h3>
                  <p className="text-[10px] text-[#8C6D46] font-mono">{selectedAgent?.roleTitle}</p>
                </div>
              </div>

              <button
                onClick={() => handleInspectDocs(selectedAgentSlug)}
                className="text-[10px] font-mono text-[#8C6D46] hover:text-[#12231A] flex items-center gap-1 cursor-pointer border border-[#C5A880]/30 px-2 py-1 bg-[#F4EFE6]/50"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Guardrails
              </button>
            </div>

            {/* Routine Select */}
            <div>
              <label className="block text-xs font-serif font-bold text-[#12231A] uppercase tracking-wider mb-1.5">
                Target Routine to Run *
              </label>
              <select
                value={selectedRoutineId}
                onChange={(e) => setSelectedRoutineId(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#C5A880]/40 px-3 py-2 text-xs text-[#12231A] focus:outline-none focus:border-[#C5A880] font-sans"
              >
                {selectedAgent?.routines.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.id})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#8C6D46] mt-1 italic">
                {selectedAgent?.routines.find((r) => r.id === selectedRoutineId)?.description}
              </p>
            </div>

            {/* Target Perfume / Product */}
            <div>
              <label className="block text-xs font-serif font-bold text-[#12231A] uppercase tracking-wider mb-1.5">
                Featured Perfume Creation / Focus *
              </label>
              <select
                value={targetProduct}
                onChange={(e) => setTargetProduct(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#C5A880]/40 px-3 py-2 text-xs text-[#12231A] focus:outline-none focus:border-[#C5A880]"
              >
                <option value="Oud Royal Rajasthan">Oud Royal Rajasthan (Extrait de Parfum)</option>
                <option value="Imperial Discovery Wardrobe">Imperial Discovery Wardrobe (5x Master Flacons)</option>
                <option value="Taif Rose & Ambergris">Taif Rose & Ambergris (First Harvest)</option>
                <option value="Kannauj Vetiver Rain">Kannauj Vetiver Rain (Mitti Attar Hydro-distilled)</option>
                <option value="Mysore Sandalwood Sovereign">Mysore Sandalwood Sovereign (Government-Reserve)</option>
                {products && products.map((p) => (
                  <option key={p.id} value={p.title}>
                    {p.title} ({p.concentration || 'Extrait'})
                  </option>
                ))}
              </select>
            </div>

            {/* Strategic Directive / Notes */}
            <div>
              <label className="block text-xs font-serif font-bold text-[#12231A] uppercase tracking-wider mb-1.5">
                Merchant Strategic Directives (Optional)
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                placeholder="e.g. Focus on wedding gifting season in Mumbai/Delhi; highlight 14-hour longevity in tropical climates; position discovery set as zero-risk trial."
                className="w-full bg-[#FAF8F5] border border-[#C5A880]/40 p-2.5 text-xs text-[#12231A] focus:outline-none focus:border-[#C5A880] placeholder-[#12231A]/40 resize-none font-sans"
              />
            </div>

            {/* Execute Button */}
            <button
              onClick={() => handleRunRoutine()}
              disabled={isExecuting}
              className="w-full py-3 bg-[#12231A] hover:bg-[#182F23] text-[#DFCAAB] text-xs font-serif font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-[#C5A880]/40"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Synthesizing Luxury Deliverable...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-[#C5A880]" />
                  <span>Execute Routine Autonomously</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-sm">
                <strong>Execution Notice:</strong> {errorMsg}
              </div>
            )}
          </div>

          {/* Quick Routine Shortcuts for Current Agent */}
          <div className="bg-[#FAF8F5] p-4 border border-[#C5A880]/20 text-xs">
            <h4 className="font-serif font-bold text-[#12231A] uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#C5A880]" />
              Quick Routine Presets
            </h4>
            <div className="space-y-1.5">
              {selectedAgent?.routines.map((routine) => (
                <button
                  key={routine.id}
                  onClick={() => {
                    setSelectedRoutineId(routine.id);
                    handleRunRoutine(selectedAgentSlug, routine.id);
                  }}
                  disabled={isExecuting}
                  className={`w-full text-left p-2 border transition-all cursor-pointer flex items-center justify-between text-[11px] ${
                    selectedRoutineId === routine.id
                      ? 'bg-white border-[#C5A880] font-semibold text-[#12231A]'
                      : 'bg-[#F4EFE6]/50 border-transparent hover:border-[#C5A880]/40 text-[#4A5568]'
                  }`}
                >
                  <span className="truncate">{routine.name}</span>
                  <ChevronRight className="w-3 h-3 text-[#C5A880] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Deliverable Workspace & Action Center (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-[#C5A880]/30 shadow-sm min-h-[520px] flex flex-col justify-between">
            {/* Header / Action Bar */}
            <div className="p-4 border-b border-[#C5A880]/20 flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5]">
              <div>
                <h3 className="font-serif font-bold text-sm text-[#12231A]">
                  {result ? result.deliverableTitle : 'Ready to Execute Routine'}
                </h3>
                <p className="text-[10px] text-[#8C6D46] font-mono">
                  {result
                    ? `Generated by ${result.agent?.name || 'AI Marketing Employee'} • Verified Brand Guardrails`
                    : 'Select routine and product on the left to generate publishable assets.'}
                </p>
              </div>

              {result && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1.5 bg-white hover:bg-[#F4EFE6] border border-[#C5A880]/40 text-[#12231A] text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
                    title="Copy Markdown"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  {/* Context-aware 1-Click Publishing */}
                  {selectedAgentSlug === 'seo-employee' && (
                    <button
                      onClick={handlePublishToJournal}
                      className="px-2.5 py-1.5 bg-[#12231A] hover:bg-[#182F23] text-[#DFCAAB] border border-[#C5A880]/40 text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Push to Editorial Journal</span>
                    </button>
                  )}

                  {selectedAgentSlug === 'social-media-employee' && (
                    <button
                      onClick={handlePublishToReels}
                      className="px-2.5 py-1.5 bg-[#12231A] hover:bg-[#182F23] text-[#DFCAAB] border border-[#C5A880]/40 text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Film className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Push to Reels Carousel</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Notification Banner */}
            {publishSuccessMsg && (
              <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{publishSuccessMsg}</span>
              </div>
            )}

            {/* Deliverable Body */}
            <div className="p-6 overflow-y-auto max-h-[600px] font-sans text-xs text-[#12231A] space-y-4">
              {isExecuting ? (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-2 border-[#C5A880] border-t-transparent animate-spin" />
                  <p className="font-serif font-bold text-sm text-[#12231A]">
                    {selectedAgent?.name} is drafting deliverable...
                  </p>
                  <p className="text-[11px] text-[#8C6D46] max-w-sm">
                    Synthesizing authentic Kannauj maceration principles, audience hook, and conversion psychology.
                  </p>
                </div>
              ) : result ? (
                <div className="prose prose-sm max-w-none space-y-3 leading-relaxed">
                  {result.outputMarkdown.split('\n\n').map((block, idx) => {
                    if (block.startsWith('# ')) {
                      return (
                        <h1 key={idx} className="text-xl font-serif font-bold text-[#12231A] border-b border-[#C5A880]/30 pb-2 pt-2">
                          {block.replace('# ', '')}
                        </h1>
                      );
                    }
                    if (block.startsWith('## ')) {
                      return (
                        <h2 key={idx} className="text-sm font-serif font-bold uppercase tracking-wider text-[#8C6D46] pt-3 border-t border-[#F4EFE6]">
                          {block.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (block.startsWith('### ')) {
                      return (
                        <h3 key={idx} className="text-xs font-serif font-bold text-[#12231A] pt-2 text-emerald-950">
                          {block.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (block.startsWith('> ')) {
                      return (
                        <blockquote key={idx} className="p-3 bg-[#FAF8F5] border-l-2 border-[#C5A880] text-xs italic text-[#1B201E]">
                          {block.replace('> ', '')}
                        </blockquote>
                      );
                    }
                    if (block.startsWith('* ') || block.startsWith('- ')) {
                      return (
                        <ul key={idx} className="list-disc pl-5 space-y-1 text-xs text-[#2D3748]">
                          {block.split('\n').map((li, liIdx) => (
                            <li key={liIdx}>{li.replace(/^[-*]\s+/, '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    if (block.match(/^\d+\.\s/)) {
                      return (
                        <ol key={idx} className="list-decimal pl-5 space-y-1 text-xs text-[#2D3748]">
                          {block.split('\n').map((li, liIdx) => (
                            <li key={liIdx}>{li.replace(/^\d+\.\s+/, '')}</li>
                          ))}
                        </ol>
                      );
                    }
                    return (
                      <p key={idx} className="text-xs text-[#2D3748] leading-relaxed">
                        {block}
                      </p>
                    );
                  })}
                </div>
              ) : (
                <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 text-[#8C6D46]">
                  <Bot className="w-12 h-12 text-[#C5A880]/50" />
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#12231A]">
                      Autonomous Marketing Workspace Idle
                    </h4>
                    <p className="text-[11px] max-w-sm mt-1">
                      Choose an AI marketing employee and click <strong>&quot;Execute Routine Autonomously&quot;</strong> to generate viral reels, 1,500-word articles, ad hooks, or wholesale proposals.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRunRoutine('social-media-employee', 'soc-draft-queue')}
                      className="px-3 py-1.5 bg-[#F4EFE6] hover:bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#12231A] text-[11px] font-mono cursor-pointer"
                    >
                      Try: 5 Viral Scent Reels
                    </button>
                    <button
                      onClick={() => handleRunRoutine('seo-employee', 'seo-draft-run')}
                      className="px-3 py-1.5 bg-[#F4EFE6] hover:bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#12231A] text-[11px] font-mono cursor-pointer"
                    >
                      Try: 1,500-Word Kannauj Article
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Status Bar */}
            <div className="p-3 bg-[#FAF8F5] border-t border-[#C5A880]/20 flex items-center justify-between text-[10px] font-mono text-[#8C6D46]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>MarkFulton Autonomous Contract Verified</span>
              </div>
              <div>
                <span>Source: ai-employees/{selectedAgentSlug}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract & Role Guardrails Modal / Drawer */}
      {inspectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#C5A880] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 bg-[#12231A] text-[#FAF8F5] flex items-center justify-between border-b border-[#182F23]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                <h3 className="font-serif font-bold text-sm tracking-wide text-white">
                  Autonomous Operating Contract & Guardrails ({selectedAgent?.name})
                </h3>
              </div>
              <button
                onClick={() => setInspectorOpen(false)}
                className="text-[#DFCAAB] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#C5A880]/30 bg-[#FAF8F5] px-4 pt-2">
              <button
                onClick={() => setInspectorTab('contract')}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold cursor-pointer border-b-2 transition-all ${
                  inspectorTab === 'contract'
                    ? 'border-[#C5A880] text-[#12231A] bg-white'
                    : 'border-transparent text-[#8C6D46] hover:text-[#12231A]'
                }`}
              >
                CONTRACT.md (Boundaries & Safety)
              </button>
              <button
                onClick={() => setInspectorTab('role')}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold cursor-pointer border-b-2 transition-all ${
                  inspectorTab === 'role'
                    ? 'border-[#C5A880] text-[#12231A] bg-white'
                    : 'border-transparent text-[#8C6D46] hover:text-[#12231A]'
                }`}
              >
                ROLE.md (Mission & Scope)
              </button>
            </div>

            {/* Document Content */}
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-[#12231A] bg-[#FAF8F5]/50 leading-relaxed whitespace-pre-wrap">
              {inspectorLoading ? (
                <div className="py-12 text-center text-[#8C6D46]">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#C5A880]" />
                  Loading contract from disk...
                </div>
              ) : inspectorTab === 'contract' ? (
                inspectorDocs?.contractText
              ) : (
                inspectorDocs?.roleText
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#FAF8F5] border-t border-[#C5A880]/30 flex items-center justify-between text-[11px]">
              <span className="text-[#8C6D46]">
                Location: <code className="text-[#12231A]">ai-employees/{selectedAgentSlug}/{inspectorTab.toUpperCase()}.md</code>
              </span>
              <button
                onClick={() => setInspectorOpen(false)}
                className="px-4 py-1.5 bg-[#12231A] text-[#DFCAAB] text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
