export const CATS = ['Phone screens', 'Batteries', 'Chargers and cables', 'Laptop parts', 'Accessories', 'Tools and kits', 'Other']
export type Product = { id: string; created_at: string; name: string; category: string; description: string; price_kes: number; in_stock: boolean; active: boolean; image_path: string | null }
export const kes = (n: number) => 'KSh ' + n.toLocaleString()
