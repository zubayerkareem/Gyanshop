import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, ChevronLeft, Clock, Tag } from 'lucide-react'
import { api } from '@/lib/api'

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    setLoading(true); setError(null)
    api.getBlogPost(slug)
      .then(setPost)
      .catch(e => setError(typeof e === 'string' ? e : e.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="flex justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (error) return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center text-muted-foreground">{error}</div>
  )

  if (!post) return null

  const isHtml = post.content?.trimStart().startsWith('<')

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        to="/"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        হোম পেজে ফিরুন
      </Link>

      {/* Cover image */}
      {post.cover_image && (
        <div className="mb-8 overflow-hidden rounded-xl border border-border">
          <img src={post.cover_image} alt={post.title} className="w-full object-cover max-h-80" />
        </div>
      )}

      <article>
        {/* Meta */}
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {post.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-semibold">
              <Tag className="h-3 w-3" />
              {post.category}
            </span>
          )}
          <span>{new Date(post.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          {post.read_time && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.read_time}
            </span>
          )}
        </div>

        <h1 className="mb-6 text-2xl font-bold text-foreground border-b border-border pb-4">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mb-6 text-base text-muted-foreground leading-relaxed border-l-4 border-primary/30 pl-4 italic">
            {post.excerpt}
          </p>
        )}

        {isHtml ? (
          <div
            className="text-sm leading-relaxed text-foreground/80
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:text-foreground
              [&_h2]:text-xl  [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-foreground
              [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-foreground
              [&_p]:mb-3
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul>li]:mb-1
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol>li]:mb-1
              [&_blockquote]:border-l-[3px] [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-3
              [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80
              [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_s]:line-through
              [&_img]:rounded-lg [&_img]:border [&_img]:border-border [&_img]:my-4 [&_img]:max-w-full"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <div className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
            {post.content}
          </div>
        )}
      </article>
    </div>
  )
}
