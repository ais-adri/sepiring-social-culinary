export const currentUser = {
  name: "Ayu Rahmawati",
  gender: "perempuan",
  city: "Jakarta Selatan",
  tasteTags: ["Pedes", "Kopi", "Ramen", "Korea", "Dimsum"],
  tasteBars: [
    { label: "Pedes", value: 90 },
    { label: "Kopi", value: 84 },
    { label: "Ramen", value: 78 },
    { label: "Korea", value: 71 },
    { label: "Dimsum", value: 60 },
    { label: "Manis-gurih", value: 46 }
  ],
  wishlist: [1, 2, 3, 4],
  diningHistory: [
    { id: 1, restaurantId: 2, name: "Ramen Nagi", partner: "Dita K.", date: "14 Jun 2026", note: "Enak banget, kuahnya gurih!", category: "Ramen" },
    { id: 2, restaurantId: 1, name: "Soto Lamongan Pak Sadi", partner: "Rina M.", date: "2 Jun 2026", note: "Recommended! Pedas pas banget.", category: "Masakan Jawa" },
    { id: 3, restaurantId: null, name: "Warung Padang Bu Haji", partner: "Sendiri", date: "28 Mei 2026", note: "Pedes mantap, murah meriah.", category: "Masakan Padang" },
    { id: 4, restaurantId: null, name: "Kopitiam Oey", partner: "Tim kantor", date: "15 Mei 2026", note: "Kopinya juara, suasana cozy.", category: "Kopi" },
    { id: 5, restaurantId: null, name: "Myeongdong Topokki", partner: "Sendiri", date: "3 Mei 2026", note: "Topokkinya nagih!", category: "Korea" },
  ],
  verified: true,
  settings: {
    alwaysPublicMeeting: true,
    sameGenderOnly: false
  }
};

export const partners = [
  {
    id: 1,
    name: "Rina Mulyani",
    gender: "perempuan",
    avatar: "RM",
    distanceText: "2,1 km dari kamu",
    matchLevel: "Sangat cocok",
    matchReason: "5 selera sama",
    tasteTags: ["Pedes", "Kopi", "Ramen", "Sushi", "Matcha"],
    verified: true,
    wishlistIds: [1, 2, 3]
  },
  {
    id: 2,
    name: "Dita Kusuma",
    gender: "perempuan",
    avatar: "DK",
    distanceText: "3,4 km dari kamu",
    matchLevel: "Sangat cocok",
    matchReason: "4 selera sama",
    tasteTags: ["Pedes", "Korea", "Dimsum", "Bubble tea"],
    verified: true,
    wishlistIds: [2, 3, 4]
  },
  {
    id: 3,
    name: "Bima Santoso",
    gender: "laki-laki",
    avatar: "BS",
    distanceText: "1,8 km dari kamu",
    matchLevel: "Cocok",
    matchReason: "3 selera sama",
    tasteTags: ["Kopi", "Ramen", "Sate", "Western"],
    verified: true,
    wishlistIds: [1, 4]
  },
  {
    id: 4,
    name: "Arif Wibowo",
    gender: "laki-laki",
    avatar: "AW",
    distanceText: "4,2 km dari kamu",
    matchLevel: "Cocok",
    matchReason: "3 selera sama",
    tasteTags: ["Dimsum", "Korea", "Manis-gurih", "Kopi"],
    verified: false,
    wishlistIds: [3, 4]
  }
];

export type MenuItem = { name: string; price: string; note: string };

export type Restaurant = {
  id: number;
  name: string;
  cuisine: string;
  area: string;
  socialProof: number;
  similarTasteBadge: boolean;
  interestedPartnerIds: number[];
  openHours: string;
  priceRange: string;
  canBook: boolean;
  promo?: string;
  menu: MenuItem[];
};

export const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "Soto Lamongan Pak Sadi",
    cuisine: "Masakan Jawa",
    area: "Menteng",
    socialProof: 3,
    similarTasteBadge: true,
    interestedPartnerIds: [1, 3],
    openHours: "10.00 – 21.00",
    priceRange: "Rp 25.000 – 50.000",
    canBook: false,
    menu: [
      { name: "Soto Lamongan", price: "Rp 35.000", note: "Kuah segar dengan kerupuk udang" },
      { name: "Soto + Nasi + Telur", price: "Rp 42.000", note: "Best seller" },
      { name: "Gado-gado", price: "Rp 28.000", note: "" },
      { name: "Tahu Tempe Bacem", price: "Rp 12.000", note: "" },
      { name: "Es Teh Manis", price: "Rp 8.000", note: "" },
    ]
  },
  {
    id: 2,
    name: "Ramen Nagi",
    cuisine: "Ramen Jepang",
    area: "Senayan",
    socialProof: 5,
    similarTasteBadge: false,
    interestedPartnerIds: [1, 2],
    openHours: "11.00 – 22.00",
    priceRange: "Rp 75.000 – 150.000",
    canBook: true,
    promo: "Beli 1 gratis 1 ramen – weekday sebelum jam 18.00",
    menu: [
      { name: "Original King Ramen", price: "Rp 98.000", note: "Signature, kuah tonkotsu" },
      { name: "Black King Ramen", price: "Rp 108.000", note: "Dengan bawang hitam" },
      { name: "Red King Ramen", price: "Rp 108.000", note: "Pedas level 1–5" },
      { name: "Gyoza (6 pcs)", price: "Rp 45.000", note: "" },
      { name: "Chashu Don", price: "Rp 65.000", note: "Bowl nasi dengan chashu" },
      { name: "Ramune Soda", price: "Rp 28.000", note: "" },
    ]
  },
  {
    id: 3,
    name: "Myeongdong Topokki",
    cuisine: "Korea",
    area: "Kemang",
    socialProof: 2,
    similarTasteBadge: true,
    interestedPartnerIds: [1, 2, 4],
    openHours: "11.00 – 21.30",
    priceRange: "Rp 40.000 – 90.000",
    canBook: false,
    promo: "Beli 1 gratis 1 topokki – via GoFood & GrabFood",
    menu: [
      { name: "Topokki Original", price: "Rp 45.000", note: "Level pedes bisa request" },
      { name: "Topokki Keju", price: "Rp 55.000", note: "Best seller" },
      { name: "Tteokbokki + Ramen", price: "Rp 65.000", note: "Combo kenyang" },
      { name: "Odeng (4 pcs)", price: "Rp 22.000", note: "" },
      { name: "Bokkeumbap", price: "Rp 48.000", note: "Nasi goreng korea" },
      { name: "Sikhye", price: "Rp 18.000", note: "Minuman beras manis" },
    ]
  },
  {
    id: 4,
    name: "Satu Satu Coffee Company",
    cuisine: "Kopi Spesialti",
    area: "Cipete",
    socialProof: 4,
    similarTasteBadge: false,
    interestedPartnerIds: [2, 3],
    openHours: "08.00 – 22.00",
    priceRange: "Rp 35.000 – 80.000",
    canBook: true,
    menu: [
      { name: "Single Origin Pour Over", price: "Rp 55.000", note: "Pilih origin: Ethiopia / Colombia" },
      { name: "Flat White", price: "Rp 45.000", note: "" },
      { name: "Kopi Tubruk Spesialti", price: "Rp 38.000", note: "Cara tradisional, biji premium" },
      { name: "Cold Brew", price: "Rp 52.000", note: "Seduh 18 jam" },
      { name: "Croissant Butter", price: "Rp 42.000", note: "Dipanggang tiap pagi" },
      { name: "Banana Bread", price: "Rp 35.000", note: "" },
    ]
  },
  {
    id: 5,
    name: "Dimsum Xin Hao",
    cuisine: "Dimsum",
    area: "PIK",
    socialProof: 3,
    similarTasteBadge: true,
    interestedPartnerIds: [1, 4],
    openHours: "08.00 – 15.00",
    priceRange: "Rp 20.000 – 60.000",
    canBook: false,
    promo: "Beli 1 gratis 1 dimsum pilihan – s.d. akhir bulan",
    menu: [
      { name: "Hakau (4 pcs)", price: "Rp 32.000", note: "Udang segar, kulit tipis" },
      { name: "Siomay Udang (4 pcs)", price: "Rp 28.000", note: "" },
      { name: "Cheong Fun Udang", price: "Rp 35.000", note: "Best seller" },
      { name: "Char Siu Bao", price: "Rp 25.000", note: "Bakpao panggang" },
      { name: "Lo Mai Gai", price: "Rp 38.000", note: "Nasi ketan ayam dalam daun lotus" },
      { name: "Teh Poh Lie", price: "Rp 15.000", note: "Teh Tiongkok tradisional" },
    ]
  }
];

export const viralFoods = [
  { id: 1, name: "Nasi Goreng Truffle", origin: "Plataran SCBD", area: "Sudirman", heat: 3, tag: "Viral minggu ini", image: "images/food-nasi-goreng-truffle.png" },
  { id: 2, name: "Sate Taichan Goreng", origin: "Warung Taichan Senayan", area: "Senayan", heat: 2, tag: "Ramai di TikTok", image: "images/food-sate-taichan.png" },
  { id: 3, name: "Biang Kerok Sambal Matah", origin: "Dapur Bunda Kemang", area: "Kemang", heat: 3, tag: "Antri panjang", image: "images/food-sambal-matah.png" },
  { id: 4, name: "Croffle Matcha Red Bean", origin: "Kopi Nako", area: "Cipete", heat: 1, tag: "Sold out tiap pagi", image: "images/food-croffle-matcha.png" },
  { id: 5, name: "Mie Pedas Level 50", origin: "Mie Gacoan", area: "Tebet", heat: 3, tag: "Challenge pedes", image: "images/food-mie-pedas.png" },
];

export const recommendedRestaurants = [
  { restaurantId: 3, reason: "Cocok sama Ramen Nagi yang kamu suka" },
  { restaurantId: 5, reason: "Karena kamu sering makan Korea & Asia" },
  { restaurantId: 4, reason: "Kopi favoritmu ada di sini juga" },
];
