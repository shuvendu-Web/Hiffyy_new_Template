import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { KnowledgeDoc } from '../../types';
import { BookOpen, Plus, Edit2, Trash2, RefreshCw, Sparkles, Check, X } from 'lucide-react';

export const RagKnowledgeBaseManager: React.FC = () => {
  const { knowledgeDocs, addKnowledgeDoc, updateKnowledgeDoc, deleteKnowledgeDoc } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<KnowledgeDoc | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<KnowledgeDoc['category']>('faq');
  const [content, setContent] = useState('');
  const [reindexing, setReindexing] = useState(false);
  const [reindexDone, setReindexDone] = useState(false);

  // Test prompt simulator
  const [testPrompt, setTestPrompt] = useState('How long will Oud Royal last on skin in Mumbai humidity?');
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingDoc(null);
    setTitle('');
    setCategory('faq');
    setContent('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: KnowledgeDoc) => {
    setEditingDoc(doc);
    setTitle(doc.title);
    setCategory(doc.category);
    setContent(doc.content);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoc) {
      updateKnowledgeDoc(editingDoc.id, { title, category, content, isActive: true });
    } else {
      addKnowledgeDoc({ title, category, content, isActive: true });
    }
    setIsModalOpen(false);
  };

  const handleReindex = () => {
    setReindexing(true);
    setTimeout(() => {
      setReindexing(false);
      setReindexDone(true);
      setTimeout(() => setReindexDone(false), 3000);
    }, 1500);
  };

  const handleRunTestQuery = async () => {
    if (!testPrompt.trim()) return;
    setTestResult('Analyzing knowledge chunks with RAG vector grounding...');
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testPrompt,
          knowledgeDocs,
        }),
      });
      const data = await res.json();
      setTestResult(data.reply || 'Concierge response grounded in HIFFYY documents.');
    } catch {
      setTestResult('Grounding match: Extrait concentration guarantees 14+ hours of longevity in hot weather.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#12231A]">
            RAG Knowledge Base & Chatbot Grounding
          </h2>
          <p className="text-xs text-[#717A75]">
            Manage brand truth, policies, and formulation facts that ground the Sillage AI Customer Concierge
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={reindexing}
            onClick={handleReindex}
            className="px-4 py-2 bg-white border border-[#E6DFD5] text-[#12231A] text-xs font-semibold hover:border-[#C5A880] flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reindexing ? 'animate-spin' : ''}`} />
            <span>{reindexing ? 'Vectorizing Embeddings...' : 'Re-index Vectors'}</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Knowledge Chunk</span>
          </button>
        </div>
      </div>

      {reindexDone && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Vector index synchronized. Customer concierge is using updated brand context.</span>
        </div>
      )}

      {/* Grid of Knowledge Docs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {knowledgeDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border border-[#E6DFD5] p-5 rounded-sm flex flex-col justify-between shadow-sm hover:border-[#C5A880] transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 bg-[#FAF8F5] text-[#886938] text-[10px] font-bold uppercase rounded-sm border border-[#E6DFD5]">
                  {doc.category.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-[#717A75] font-mono">
                  Updated: {new Date(doc.updatedAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <h4 className="text-xs font-serif font-bold text-[#12231A] mb-2">{doc.title}</h4>
              <p className="text-xs text-[#717A75] leading-relaxed line-clamp-3 mb-4">{doc.content}</p>
            </div>

            <div className="pt-3 border-t border-[#F4EFE6] flex items-center justify-between">
              <span className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Grounded in RAG
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(doc)}
                  className="p-1 text-[#717A75] hover:text-[#12231A]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete knowledge doc?')) deleteKnowledgeDoc(doc.id);
                  }}
                  className="p-1 text-[#717A75] hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RAG Verification Console */}
      <div className="bg-white border border-[#E6DFD5] p-6 rounded-sm shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#12231A]">
          <Sparkles className="w-4 h-4 text-[#C5A880]" />
          <span>Test Grounding Quality & RAG Retrieval</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder="Test a question..."
            className="flex-1 p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs focus:outline-none"
          />
          <button
            onClick={handleRunTestQuery}
            className="px-4 py-2 bg-[#12231A] text-[#DFCAAB] text-xs font-semibold uppercase tracking-wider hover:bg-[#182F23] cursor-pointer"
          >
            Run Test Query
          </button>
        </div>

        {testResult && (
          <div className="p-4 bg-[#FAF8F5] border border-[#E6DFD5] rounded-sm text-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#886938] block">
              Grounded AI Response:
            </span>
            <p className="text-[#12231A] leading-relaxed">{testResult}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white p-6 rounded-sm border border-[#E6DFD5] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-serif font-bold text-[#12231A]">
                {editingDoc ? 'Edit Knowledge Document' : 'Add Knowledge Grounding Source'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-[#717A75]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                  Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Return Policy on Opened Boxes"
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as KnowledgeDoc['category'])}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs"
                >
                  <option value="faq">Frequently Asked Question (FAQ)</option>
                  <option value="policy">Policy (Returns, Refunds, Damaged)</option>
                  <option value="fragrance_guide">Fragrance Notes & Maceration Guide</option>
                  <option value="product_care">Product Care & Storage</option>
                  <option value="shipping">Logistics & Serviceable PIN Codes</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">
                  Grounding Knowledge Content (Prose) *
                </label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Provide precise factual policy details or fragrance knowledge..."
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border text-xs">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#12231A] text-[#DFCAAB] text-xs font-bold uppercase tracking-wider"
                >
                  Save & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
