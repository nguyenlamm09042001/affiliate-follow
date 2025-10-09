export type Deal = {
  id?: string;
  slug: string;
  name: string;
  category?: string;
  price: number;
  old_price?: number;
  image?: string;
  affiliate_link?: string;   // <— thêm
  updated_at?: string;
  active?: boolean;
};
