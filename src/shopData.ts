export const CATS = ['Phone screens', 'Batteries', 'Chargers and cables', 'Laptop parts', 'Accessories', 'Tools and kits', 'Other']
export type Product = { id: string; created_at: string; name: string; category: string; description: string; price_kes: number; in_stock: boolean; active: boolean; image_path: string | null; quantity: number | null; compatible?: string }
export const kes = (n: number) => 'KSh ' + n.toLocaleString()
export type ProductImage = { id: string; product_id: string; path: string; position: number }
export const LOW_STOCK = 3 // products with this many or fewer left are listed under Low stock on the Today tab
