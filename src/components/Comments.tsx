'use client';

import { useState, useEffect } from 'react';
import { getPostComments, createComment, getCommentCount, type Comment } from '@/lib/supabase/comments';
import { MessageCircle, Send, Loader2, CheckCircle } from 'lucide-react';

interface CommentsProps {
  postSlug: string;
  lang: 'pt-br' | 'en';
}

export function Comments({ postSlug, lang }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const texts = {
    'pt-br': {
      title: 'Comentários',
      noComments: 'Seja o primeiro a comentar!',
      yourComment: 'Seu Comentário',
      name: 'Nome',
      namePlaceholder: 'Seu nome',
      email: 'Email',
      emailPlaceholder: 'seu@email.com',
      website: 'Website (opcional)',
      websitePlaceholder: 'https://seusite.com',
      comment: 'Comentário',
      commentPlaceholder: 'Escreva seu comentário...',
      submit: 'Enviar Comentário',
      submitting: 'Enviando...',
      success: 'Comentário enviado! Aguardando aprovação.',
      minLength: 'Comentário deve ter pelo menos 10 caracteres',
      required: 'Este campo é obrigatório',
      invalidEmail: 'Email inválido',
    },
    'en': {
      title: 'Comments',
      noComments: 'Be the first to comment!',
      yourComment: 'Your Comment',
      name: 'Name',
      namePlaceholder: 'Your name',
      email: 'Email',
      emailPlaceholder: 'your@email.com',
      website: 'Website (optional)',
      websitePlaceholder: 'https://yoursite.com',
      comment: 'Comment',
      commentPlaceholder: 'Write your comment...',
      submit: 'Submit Comment',
      submitting: 'Submitting...',
      success: 'Comment submitted! Awaiting approval.',
      minLength: 'Comment must be at least 10 characters',
      required: 'This field is required',
      invalidEmail: 'Invalid email',
    },
  };

  const t = texts[lang];

  useEffect(() => {
    loadComments();
  }, [postSlug]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const [commentsData, countData] = await Promise.all([
        getPostComments(postSlug),
        getCommentCount(postSlug),
      ]);
      setComments(commentsData);
      setCount(countData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validação
    if (!name.trim() || name.trim().length < 2) {
      setError(t.required);
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.invalidEmail);
      return;
    }

    if (!content.trim() || content.trim().length < 10) {
      setError(t.minLength);
      return;
    }

    setSubmitting(true);

    try {
      const result = await createComment({
        postSlug,
        authorName: name.trim(),
        authorEmail: email.trim(),
        authorWebsite: website.trim() || undefined,
        content: content.trim(),
      });

      if (result) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setWebsite('');
        setContent('');

        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError('Erro ao enviar comentário. Tente novamente.');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Erro ao enviar comentário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 pt-16 border-t border-grey-800">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="h-6 w-6 text-cyan" />
          <h2 className="text-2xl font-bold text-grey-50">
            {t.title} ({count})
          </h2>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-cyan animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-grey-400">
          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>{t.noComments}</p>
        </div>
      ) : (
        <div className="space-y-6 mb-12">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-grey-900/30 border border-grey-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-semibold text-grey-50">{comment.authorName}</div>
                  <div className="text-sm text-grey-500">
                    {new Date(comment.createdAt).toLocaleDateString(lang)}
                  </div>
                </div>
              </div>
              <p className="text-grey-300 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Comment Form */}
      <div className="bg-grey-900/30 border border-grey-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold text-grey-50 mb-6">{t.yourComment}</h3>

        {submitted && (
          <div className="mb-6 p-4 bg-green-950/50 border border-green-800 rounded-lg flex items-center gap-2 text-green-400">
            <CheckCircle className="h-5 w-5" />
            <p>{t.success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-grey-300 mb-2">
                {t.name} *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full px-4 py-2 bg-grey-900 border border-grey-700 rounded-lg text-grey-50 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-grey-300 mb-2">
                {t.email} *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full px-4 py-2 bg-grey-900 border border-grey-700 rounded-lg text-grey-50 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-grey-300 mb-2">
              {t.website}
            </label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder={t.websitePlaceholder}
              className="w-full px-4 py-2 bg-grey-900 border border-grey-700 rounded-lg text-grey-50 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-grey-300 mb-2">
              {t.comment} *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.commentPlaceholder}
              rows={6}
              className="w-full px-4 py-2 bg-grey-900 border border-grey-700 rounded-lg text-grey-50 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent resize-none"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-950/50 border border-red-800 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-cyan text-grey-950 font-semibold rounded-lg hover:bg-cyan/90 disabled:bg-grey-700 disabled:text-grey-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t.submitting}
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                {t.submit}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
