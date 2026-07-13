'use client'

import { Star, UserCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type ReviewOpportunity = {
  listingId: string
  listingTitle: string
  revieweeId: string
  revieweeName: string
  roleLabel: string
}

type VisibleReview = {
  id: string
  listingTitle: string
  reviewerName: string
  rating: number
  comment: string | null
  createdAt: string
}

type Copy = {
  title: string
  intro: string
  empty: string
  pendingTitle: string
  rating: string
  comment: string
  recommend: string
  submit: string
  submitting: string
  submitted: string
  visibleTitle: string
}

export default function ReviewFlowPanel({
  opportunities,
  visibleReviews,
  copy,
}: {
  opportunities: ReviewOpportunity[]
  visibleReviews: VisibleReview[]
  copy: Copy
}) {
  const router = useRouter()
  const [active, setActive] = useState(opportunities[0]?.revieweeId || '')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [recommends, setRecommends] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const selected =
    opportunities.find((item) => item.revieweeId === active) ||
    opportunities[0]

  async function submitReview() {
    if (!selected) return
    setLoading(true)
    setMessage('')
    const response = await fetch('/api/account/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: selected.listingId,
        revieweeId: selected.revieweeId,
        rating,
        communicationRating: rating,
        paymentRating: rating,
        accuracyRating: rating,
        recommends,
        comment,
      }),
    })
    const result = (await response.json()) as { error?: string }
    setLoading(false)
    if (!response.ok) {
      setMessage(result.error || 'Review could not be saved.')
      return
    }
    setComment('')
    setMessage(copy.submitted)
    router.refresh()
  }

  return (
    <section className="mt-10 border-t border-[#dfe3e8] pt-10">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[#eef4ff] text-[#0866ff]">
          <UserCheck className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-2xl tracking-[-.035em]">{copy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#667085]">{copy.intro}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <article className="rounded-[20px] border border-[#e1e5ec] bg-white p-5">
          <h3 className="font-semibold">{copy.pendingTitle}</h3>
          {selected ? (
            <div className="mt-4 space-y-4">
              {opportunities.length > 1 ? (
                <select
                  value={selected.revieweeId}
                  onChange={(event) => setActive(event.target.value)}
                  className="h-12 w-full rounded-[14px] border border-[#d7deed] bg-white px-4 text-sm font-semibold"
                >
                  {opportunities.map((item) => (
                    <option key={`${item.listingId}-${item.revieweeId}`} value={item.revieweeId}>
                      {item.listingTitle} - {item.revieweeName}
                    </option>
                  ))}
                </select>
              ) : null}
              <div className="rounded-[16px] bg-[#f6f8fc] p-4">
                <strong>{selected.revieweeName}</strong>
                <p className="mt-1 text-sm text-[#667085]">
                  {selected.roleLabel} | {selected.listingTitle}
                </p>
              </div>
              <div>
                <span className="text-sm font-semibold">{copy.rating}</span>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="rounded-[10px] p-1 text-[#0866ff]"
                      aria-label={`${value} stars`}
                    >
                      <Star
                        className="h-6 w-6"
                        fill={value <= rating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="text-sm font-semibold">{copy.comment}</span>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={4}
                  maxLength={1200}
                  className="mt-2 w-full rounded-[14px] border border-[#d7deed] px-4 py-3 text-sm outline-none focus:border-[#0866ff]"
                />
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={recommends}
                  onChange={(event) => setRecommends(event.target.checked)}
                  className="h-4 w-4"
                />
                {copy.recommend}
              </label>
              <button
                type="button"
                onClick={submitReview}
                disabled={loading}
                className="inline-flex min-h-11 items-center justify-center rounded-[14px] bg-[#0866ff] px-5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? copy.submitting : copy.submit}
              </button>
              {message ? <p className="text-sm text-[#667085]">{message}</p> : null}
            </div>
          ) : (
            <p className="mt-4 rounded-[16px] bg-[#f6f8fc] p-4 text-sm text-[#667085]">
              {copy.empty}
            </p>
          )}
        </article>

        <article className="rounded-[20px] border border-[#e1e5ec] bg-white p-5">
          <h3 className="font-semibold">{copy.visibleTitle}</h3>
          <div className="mt-4 space-y-3">
            {visibleReviews.length ? (
              visibleReviews.map((review) => (
                <div key={review.id} className="rounded-[16px] border border-[#e1e5ec] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm">{review.reviewerName}</strong>
                    <span className="flex text-[#0866ff]">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} className="h-3.5 w-3.5" fill="currentColor" />
                      ))}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#667085]">{review.listingTitle}</p>
                  {review.comment ? (
                    <p className="mt-3 text-sm leading-6 text-[#344054]">{review.comment}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="rounded-[16px] bg-[#f6f8fc] p-4 text-sm text-[#667085]">
                {copy.empty}
              </p>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}
