export type Language = 'en' | 'es' | 'pt' | 'fr' | 'de' | 'it' | 'nl' | 'pl' | 'sv' | 'da' | 'no' | 'fi' | 'el' | 'cs' | 'ro' | 'hu' | 'uk' | 'zh-hans' | 'zh-hant' | 'ja' | 'ko' | 'hi' | 'bn' | 'ur' | 'ta' | 'id' | 'th' | 'vi' | 'ms' | 'fil' | 'ar' | 'tr' | 'sw';

export interface Book {
  id: string;
  title: string;
  description: string;
  ageRange: string;
  status: 'Available Now' | 'Coming Soon';
  price: number;
  coverImage: string;
  category: 'Alphabet' | 'Dinosaur' | 'Animal' | 'Landmark';
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  pricing: {
    starter: number;
    professional: number;
    premium: number;
  };
}

export interface CartItem {
  bookId: string;
  quantity: number;
}
