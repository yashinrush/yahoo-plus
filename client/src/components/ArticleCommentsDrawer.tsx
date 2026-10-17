import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Send,
  Loader2,
  ShieldAlert,
  Clock,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import type { Article, UserComment, DiscussionSentiment } from '../types/index.js';
import { useLanguage } from '../context/LanguageContext.js';

interface ArticleCommentsDrawerProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ArticleCommentsDrawer: React.FC<ArticleCommentsDrawerProps> = ({
  article,
  isOpen,
  onClose,
}) => {
  const { lang } = useLanguage();
  const [comments, setComments] = useState<UserComment[]>([]);
  const [sentiment, setSentiment] = useState<DiscussionSentiment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'likes' | 'newest'>('likes');
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch comments and AI sentiment for current article
  const fetchComments = useCallback(async () => {
    if (!article) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        sort: sortBy,
        lang,
        title: article.title,
      });
      const res = await fetch(`/api/comments/article/${encodeURIComponent(article.id)}?${params}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        if (data.sentiment) {
          setSentiment(data.sentiment);
        }
      }
    } catch (err) {
      console.warn('Could not load comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [article, sortBy, lang]);

  useEffect(() => {
    if (isOpen && article) {
      fetchComments();
    } else {
      setComments([]);
      setSentiment(null);
      setNewCommentText('');
      setSubmitSuccess(false);
    }
  }, [isOpen, article, fetchComments]);

  // Handle post new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || !newCommentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/comments/article/${encodeURIComponent(article.id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newCommentText.trim(),
          articleData: {
            title: article.title,
            description: article.description,
            url: article.url,
            sourceName: article.source.name,
            category: article.category,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setComments((prev) => [data.comment, ...prev]);
          setNewCommentText('');
          setSubmitSuccess(true);
          setTimeout(() => setSubmitSuccess(false), 3000);
          // Refresh sentiment asynchronously
          fetchComments();
        }
      }
    } catch (err) {
      console.warn('Failed to submit comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle like / upvote
  const handleLike = async (commentId: string) => {
    if (likedCommentIds.has(commentId)) return;

    // Optimistic UI update
    setLikedCommentIds((prev) => new Set(prev).add(commentId));
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likesCount: c.likesCount + 1 } : c))
    );

    try {
      await fetch(`/api/comments/${commentId}/like`, { method: 'POST' });
    } catch (err) {
      console.warn('Failed to upvote comment:', err);
    }
  };

  if (!isOpen || !article) return null;

  const sentimentColor =
    sentiment?.label === 'Supportive'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : sentiment?.label === 'Critical'
      ? 'text-rose-700 bg-rose-50 border-rose-200'
      : sentiment?.label === 'Mixed'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-blue-700 bg-blue-50 border-blue-200';

  const barColor =
    sentiment?.label === 'Supportive'
      ? 'bg-emerald-500'
      : sentiment?.label === 'Critical'
      ? 'bg-rose-500'
      : sentiment?.label === 'Mixed'
      ? 'bg-amber-500'
      : 'bg-blue-500';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200">
          
          {/* Top Sticky Header */}
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 backdrop-blur-xs sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="bg-[#e60012] text-white text-[10px] font-black px-1.5 py-0.5 rounded tracking-wider">
                Y! NEWS
              </span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                {article.category || 'ニュース'}
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.publishedAt || '最近'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            
            {/* Article Headline & Meta */}
            <div className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                {article.title}
              </h2>

              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">
                    {article.source.name || 'Yahoo! ニュース'}
                  </span>
                  <span>•</span>
                  <span>{lang === 'ja' ? '読了目安 約2分' : '2 min read'}</span>
                </div>

                {article.url && (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    <span>{lang === 'ja' ? '提供社で全文を読む' : 'Original Source'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Article Image (if present) */}
            {article.image && (
              <div className="rounded-lg overflow-hidden border border-slate-200 shadow-xs max-h-72">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Description / Lead Paragraph */}
            <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-3 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
              <p className="font-normal">{article.description}</p>
              {article.content && (
                <p className="text-slate-600">{article.content}</p>
              )}
            </div>

            {/* AI Summary Card (if article has summary) */}
            {article.aiSummary && (
              <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-lg border border-blue-100 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span>{lang === 'ja' ? 'Gemini 2.5 Flash AI要約' : 'Gemini AI Executive Summary'}</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {article.aiSummary.summary}
                </p>
                {article.aiSummary.keyPoints && article.aiSummary.keyPoints.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                    {article.aiSummary.keyPoints.map((pt, idx) => (
                      <li key={idx}>{pt}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <hr className="border-slate-200" />

            {/* ========================================================================= */}
            {/* YAHOO! JAPAN COMMENTS (ヤフコメ - Yafu-Kome) SECTION */}
            {/* ========================================================================= */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#e60012]" />
                  <h3 className="font-bold text-base text-slate-900">
                    {lang === 'ja' ? 'みんなの意見・コメント (ヤフコメ)' : 'Community Discussion (Yafu-Kome)'}
                  </h3>
                  <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
                    {comments.length}
                  </span>
                </div>

                {/* Sort Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-xs font-medium">
                  <button
                    onClick={() => setSortBy('likes')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      sortBy === 'likes'
                        ? 'bg-white text-blue-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'ja' ? 'おすすめ順' : 'Top Liked'}
                  </button>
                  <button
                    onClick={() => setSortBy('newest')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      sortBy === 'newest'
                        ? 'bg-white text-blue-700 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'ja' ? '新着順' : 'Newest'}
                  </button>
                </div>
              </div>

              {/* Gemini AI Sentiment Analysis & Consensus Banner */}
              {sentiment && (
                <div className={`p-3.5 rounded-lg border text-xs space-y-2.5 ${sentimentColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>{lang === 'ja' ? 'AI 世論・論点分析' : 'AI Community Consensus'}</span>
                      <span className="text-[10px] bg-white/80 px-1.5 py-0.5 rounded border border-current font-semibold">
                        {lang === 'ja' ? sentiment.labelJa : sentiment.label}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold">
                      {sentiment.sentimentScore}% {lang === 'ja' ? '支持・共感度' : 'Support Score'}
                    </span>
                  </div>

                  {/* Sentiment Bar */}
                  <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-all duration-500`}
                      style={{ width: `${sentiment.sentimentScore}%` }}
                    />
                  </div>

                  <p className="text-slate-700 font-medium leading-relaxed">
                    {sentiment.consensusSummary}
                  </p>

                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-black/5">
                    <span>
                      {lang === 'ja'
                        ? `分析対象: ${sentiment.totalAnalyzed}件のコメント`
                        : `Analyzed ${sentiment.totalAnalyzed} comments`}
                    </span>
                    <span className="italic">Powered by Google Gemini 2.5 Flash</span>
                  </div>
                </div>
              )}

              {/* Comment Submission Form */}
              <form onSubmit={handleSubmitComment} className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">
                    T
                  </div>
                  <span className="font-bold">田中 太郎 (Taro)</span>
                  <span className="text-[10px] text-slate-400">として投稿</span>
                </div>

                <div className="relative">
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={
                      lang === 'ja'
                        ? 'この記事に対する意見や考えを入力してください（誹謗中傷はお控えください）'
                        : 'Share your respectful thoughts on this story...'
                    }
                    rows={3}
                    maxLength={1000}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  />
                  <div className="absolute right-2 bottom-2 text-[10px] text-slate-400">
                    {newCommentText.length} / 1000
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <ShieldAlert className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>
                      {lang === 'ja'
                        ? 'Yahoo! JAPAN ガイドラインに準拠した投稿をお願いします。'
                        : 'Please adhere to respectful community guidelines.'}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !newCommentText.trim()}
                    className="px-4 py-1.5 bg-[#e60012] hover:bg-red-700 disabled:bg-slate-300 text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{lang === 'ja' ? '投稿中...' : 'Posting...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{lang === 'ja' ? 'コメントを投稿' : 'Post Comment'}</span>
                      </>
                    )}
                  </button>
                </div>

                {submitSuccess && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === 'ja' ? 'コメントを投稿しました！' : 'Comment posted successfully!'}</span>
                  </div>
                )}
              </form>

              {/* Comments List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8 text-slate-400 gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>{lang === 'ja' ? 'コメントを読み込み中...' : 'Loading comments...'}</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                  <MessageSquare className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <p>{lang === 'ja' ? 'まだコメントがありません。最初の意見を投稿しましょう！' : 'No comments yet. Be the first to share your perspective!'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => {
                    const isLiked = likedCommentIds.has(comment.id);
                    return (
                      <div
                        key={comment.id}
                        className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                              {comment.user?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="font-bold text-slate-800">
                              {comment.user?.name || '一般ユーザー'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(comment.createdAt).toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                          {comment.content}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <button
                            onClick={() => handleLike(comment.id)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                              isLiked
                                ? 'bg-red-50 text-[#e60012] border border-red-200 font-bold'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-[#e60012]' : ''}`} />
                            <span>
                              {lang === 'ja' ? '共感した' : 'Helpful'} ({comment.likesCount})
                            </span>
                          </button>

                          {comment.likesCount >= 10 && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                              {lang === 'ja' ? '注目コメント' : 'Top Voice'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
