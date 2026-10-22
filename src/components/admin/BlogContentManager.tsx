import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BlogPost } from '../../types';
import { Plus, Edit2, Trash2, BookOpen, Youtube, Check, X } from 'lucide-react';

export const BlogContentManager: React.FC = () => {
  const { blogPosts, addBlogPost, updateBlogPost } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Heritage & Craft');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [author, setAuthor] = useState('Vikramaditya Rao, Nose & Founder');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [readTime, setReadTime] = useState('5 min read');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  const handleOpenCreate = () => {
    setEditingPost(null);
    setTitle('');
    setCategory('Heritage & Craft');
    setExcerpt('');
    setContent('');
    setFeaturedImage('https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=80');
    setAuthor('Vikramaditya Rao, Nose & Founder');
    setYoutubeUrl('');
    setReadTime('5 min read');
    setStatus('published');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: BlogPost) => {
    setEditingPost(p);
    setTitle(p.title);
    setCategory(p.category);
    setExcerpt(p.excerpt);
    setContent(p.content);
    setFeaturedImage(p.featuredImage);
    setAuthor(p.author);
    setYoutubeUrl(p.youtubeUrl || '');
    setReadTime(p.readTime);
    setStatus(p.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingPost) {
      updateBlogPost(editingPost.id, {
        title,
        slug,
        category,
        excerpt,
        content,
        featuredImage,
        author,
        youtubeUrl: youtubeUrl || undefined,
        readTime,
        status,
      });
    } else {
      addBlogPost({
        title,
        slug,
        category,
        excerpt,
        content,
        featuredImage,
        author,
        youtubeUrl: youtubeUrl || undefined,
        readTime,
        status,
        publishedAt: new Date().toISOString().split('T')[0],
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#12231A]">
            Editorial Journal & Fragrance Education
          </h2>
          <p className="text-xs text-[#717A75]">
            Publish perfumery masterclasses, botanical distillation essays, and video campaigns
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-[#12231A] text-[#DFCAAB] text-xs uppercase tracking-wider font-bold hover:bg-[#182F23] flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Write Editorial Article</span>
        </button>
      </div>

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white border border-[#E6DFD5] rounded-sm overflow-hidden flex flex-col justify-between shadow-sm hover:border-[#C5A880] transition-colors"
          >
            <div>
              <div className="relative aspect-[16/9] w-full bg-[#182F23]">
                <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 px-2 py-0.5 bg-[#12231A]/80 text-white text-[10px] uppercase font-semibold">
                  {post.category}
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/90 text-[#12231A] text-[10px] font-bold uppercase">
                  {post.status}
                </div>
              </div>

              <div className="p-5">
                <span className="text-[10px] text-[#717A75] font-mono block mb-1">
                  {post.publishedAt} • {post.readTime}
                </span>
                <h3 className="text-base font-serif font-bold text-[#12231A] mb-2">{post.title}</h3>
                <p className="text-xs text-[#717A75] line-clamp-2 leading-relaxed mb-3">
                  {post.excerpt}
                </p>
                <span className="text-[11px] text-[#886938] font-medium block">By {post.author}</span>
              </div>
            </div>

            <div className="p-3 border-t border-[#F4EFE6] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#717A75]">Slug: /{post.slug}</span>
              <button
                onClick={() => handleOpenEdit(post)}
                className="p-1 text-[#717A75] hover:text-[#12231A] cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white p-6 rounded-sm border border-[#E6DFD5] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-serif font-bold text-[#12231A]">
                {editingPost ? 'Edit Journal Article' : 'Compose New Journal Article'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-[#717A75]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-serif font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">Featured Cover Image URL</label>
                <input
                  type="url"
                  required
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">YouTube Video Essay URL</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">Lead Excerpt</label>
                <textarea
                  rows={2}
                  required
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full p-2 bg-[#FAF8F5] border border-[#E6DFD5] text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#717A75] uppercase mb-1">Full Article Prose</label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
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
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
