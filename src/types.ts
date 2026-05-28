export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  shortDescription: string;
  description: string;
  mainImage: string;
  gallery: string[];
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutForm {
  name: string;
  address: string;
  phone: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customerInfo: CheckoutForm;
  date: string;
}

export type Category = 'Tous' | 'Électronique' | 'Mode' | 'Maison & Déco' | 'Livres & Papeterie';