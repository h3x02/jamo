import { products } from './data'

export type Filters = { cat: string; brands: string[]; max: number; stock: boolean; rating: number }
export const MAX_PRICE = 2000000
export const defaultFilters: Filters = { cat: '', brands: [], max: MAX_PRICE, stock: false, rating: 0 }
export const searchProducts = (q: string) => {
  const s = q.trim().replace(/ي/g, 'ی').replace(/ك/g, 'ک')
  return products.filter((p) => (p.name + p.brand).includes(s))
}
