import { useEffect, useState, type AnchorHTMLAttributes } from 'react'

function parse() {
  const h = location.hash.slice(1) || '/'
  const [path, qs = ''] = h.split('?')
  return { path, query: new URLSearchParams(qs) }
}

export function useRoute() {
  const [r, setR] = useState(parse)
  useEffect(() => {
    const f = () => setR(parse())
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  return r
}

export const navigate = (to: string) => {
  location.hash = to
}

export function Link({ to, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={'#' + to} {...rest} />
}
