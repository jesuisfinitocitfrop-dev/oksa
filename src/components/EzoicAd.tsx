'use client'

import { useEffect } from 'react'

interface Props {
  id: number
  className?: string
}

export default function EzoicAd({ id, className }: Props) {
  useEffect(() => {
    const ez = (window as any).ezstandalone
    if (ez) {
      ez.cmd.push(function () {
        ez.showAds(id)
      })
    }
  }, [id])

  return (
    <div className={className}>
      <div id={`ezoic-pub-ad-placeholder-${id}`} />
    </div>
  )
}
