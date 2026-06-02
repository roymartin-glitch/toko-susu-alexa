// Dummy data + helpers for KasirKu POS

export const formatRupiah = (n) => {
  const num = Number(n) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
};

export const formatDateID = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDateTimeID = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const pad = (x) => String(x).padStart(2,'0');
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const CATEGORIES = ['Susu UHT','Susu Kental Manis','Yogurt','Minuman','Snack','Lainnya'];

export const initialProducts = [
  { id: 'p1',  barcode: '8998009010019', name: 'Ultra Milk Full Cream 250ml',  category: 'Susu UHT',           buyPrice: 5500, sellPrice: 7500,  stock: 48, unit: 'pcs', createdAt: '2026-05-10' },
  { id: 'p2',  barcode: '8998009010026', name: 'Ultra Milk Coklat 250ml',      category: 'Susu UHT',           buyPrice: 5500, sellPrice: 7500,  stock: 36, unit: 'pcs', createdAt: '2026-05-10' },
  { id: 'p3',  barcode: '8992775311010', name: 'Indomilk Putih 190ml',         category: 'Susu UHT',           buyPrice: 3800, sellPrice: 5500,  stock: 60, unit: 'pcs', createdAt: '2026-05-11' },
  { id: 'p4',  barcode: '8992775311027', name: 'Indomilk Stroberi 190ml',      category: 'Susu UHT',           buyPrice: 3800, sellPrice: 5500,  stock: 24, unit: 'pcs', createdAt: '2026-05-11' },
  { id: 'p5',  barcode: '8999999019013', name: 'Milo UHT 180ml',               category: 'Minuman',            buyPrice: 4200, sellPrice: 6000,  stock: 8,  unit: 'pcs', createdAt: '2026-05-12' },
  { id: 'p6',  barcode: '8992696404014', name: 'Bear Brand 189ml',             category: 'Susu UHT',           buyPrice: 8500, sellPrice: 11000, stock: 30, unit: 'pcs', createdAt: '2026-05-12' },
  { id: 'p7',  barcode: '8997016800012', name: 'Greenfields Full Cream 250ml', category: 'Susu UHT',           buyPrice: 9000, sellPrice: 12500, stock: 18, unit: 'pcs', createdAt: '2026-05-13' },
  { id: 'p8',  barcode: '8997009010057', name: 'Cimory Yogurt Drink 250ml',    category: 'Yogurt',             buyPrice: 7200, sellPrice: 9500,  stock: 5,  unit: 'pcs', createdAt: '2026-05-13' },
  { id: 'p9',  barcode: '8992775200017', name: 'Frisian Flag Putih Kaleng',    category: 'Susu Kental Manis',  buyPrice: 9500, sellPrice: 13000, stock: 22, unit: 'pcs', createdAt: '2026-05-14' },
  { id: 'p10', barcode: '8992775200024', name: 'Frisian Flag Coklat Kaleng',   category: 'Susu Kental Manis',  buyPrice: 9500, sellPrice: 13000, stock: 0,  unit: 'pcs', createdAt: '2026-05-14' },
  { id: 'p11', barcode: '8999999028015', name: 'Dancow Fortigro 400g',         category: 'Lainnya',            buyPrice: 38000, sellPrice: 46500, stock: 12, unit: 'pcs', createdAt: '2026-05-15' },
  { id: 'p12', barcode: '8999999017019', name: 'Nestle Milo Sachet 22g',       category: 'Snack',              buyPrice: 1500, sellPrice: 2500,  stock: 120, unit: 'pcs', createdAt: '2026-05-15' },
];

export const initialCustomers = [
  { id: 'c1', name: 'Budi Santoso',  phone: '081234567890', email: 'budi@mail.com',   address: 'Jl. Mawar No. 12',    totalTx: 12, totalSpent: 245000, points: 245, createdAt: '2026-04-01' },
  { id: 'c2', name: 'Siti Nurhaliza', phone: '082345678901', email: '',                 address: 'Jl. Melati No. 7',     totalTx: 8,  totalSpent: 178000, points: 178, createdAt: '2026-04-05' },
  { id: 'c3', name: 'Ahmad Wijaya',  phone: '083456789012', email: 'ahmad@mail.com',  address: 'Jl. Anggrek No. 21',   totalTx: 25, totalSpent: 512000, points: 512, createdAt: '2026-03-12' },
  { id: 'c4', name: 'Dewi Lestari',  phone: '085678901234', email: '',                 address: 'Jl. Kenanga No. 4',    totalTx: 3,  totalSpent: 65000,  points: 65,  createdAt: '2026-05-01' },
  { id: 'c5', name: 'Rudi Hartono',  phone: '087890123456', email: 'rudi@mail.com',   address: 'Jl. Cempaka No. 18',   totalTx: 15, totalSpent: 320000, points: 320, createdAt: '2026-03-20' },
  { id: 'c6', name: 'Umum (Tanpa Member)', phone: '-',     email: '',                 address: '-',                    totalTx: 0,  totalSpent: 0,      points: 0,   createdAt: '2026-01-01' },
];

const today = new Date();
const d = (offsetDays, h, m) => {
  const x = new Date(today);
  x.setDate(x.getDate() - offsetDays);
  x.setHours(h, m, 0, 0);
  return x.toISOString();
};

export const initialTransactions = [
  { id: 't1', no: 'TRX-000108', date: d(0, 9, 12),  customer: 'Budi Santoso',         items: [{name:'Ultra Milk Full Cream 250ml', qty:2, price:7500},{name:'Bear Brand 189ml', qty:1, price:11000}], itemCount: 3,  subtotal: 26000, discount: 0,    tax: 0,    total: 26000, paymentMethod: 'Tunai',    paid: 30000, change: 4000 },
  { id: 't2', no: 'TRX-000109', date: d(0, 10, 35), customer: 'Umum (Tanpa Member)', items: [{name:'Milo UHT 180ml', qty:3, price:6000}],                                                                       itemCount: 3,  subtotal: 18000, discount: 0,    tax: 0,    total: 18000, paymentMethod: 'QRIS',     paid: 18000, change: 0 },
  { id: 't3', no: 'TRX-000110', date: d(0, 11, 5),  customer: 'Siti Nurhaliza',      items: [{name:'Cimory Yogurt Drink 250ml', qty:2, price:9500},{name:'Indomilk Stroberi 190ml', qty:4, price:5500}],     itemCount: 6,  subtotal: 41000, discount: 1000, tax: 0,    total: 40000, paymentMethod: 'Tunai',    paid: 50000, change: 10000 },
  { id: 't4', no: 'TRX-000111', date: d(0, 13, 22), customer: 'Ahmad Wijaya',        items: [{name:'Greenfields Full Cream 250ml', qty:3, price:12500}],                                                       itemCount: 3,  subtotal: 37500, discount: 0,    tax: 4125, total: 41625, paymentMethod: 'Transfer', paid: 41625, change: 0 },
  { id: 't5', no: 'TRX-000112', date: d(0, 15, 8),  customer: 'Dewi Lestari',        items: [{name:'Frisian Flag Putih Kaleng', qty:1, price:13000},{name:'Nestle Milo Sachet 22g', qty:5, price:2500}],     itemCount: 6,  subtotal: 25500, discount: 0,    tax: 0,    total: 25500, paymentMethod: 'Tunai',    paid: 26000, change: 500 },
  { id: 't6', no: 'TRX-000107', date: d(1, 14, 0),  customer: 'Rudi Hartono',        items: [{name:'Dancow Fortigro 400g', qty:1, price:46500}],                                                              itemCount: 1,  subtotal: 46500, discount: 500,  tax: 0,    total: 46000, paymentMethod: 'QRIS',     paid: 46000, change: 0 },
  { id: 't7', no: 'TRX-000106', date: d(1, 16, 45), customer: 'Umum (Tanpa Member)', items: [{name:'Ultra Milk Coklat 250ml', qty:4, price:7500}],                                                            itemCount: 4,  subtotal: 30000, discount: 0,    tax: 0,    total: 30000, paymentMethod: 'Tunai',    paid: 30000, change: 0 },
  { id: 't8', no: 'TRX-000105', date: d(2, 10, 30), customer: 'Budi Santoso',        items: [{name:'Indomilk Putih 190ml', qty:6, price:5500},{name:'Milo UHT 180ml', qty:2, price:6000}],                    itemCount: 8,  subtotal: 45000, discount: 2000, tax: 0,    total: 43000, paymentMethod: 'Transfer', paid: 43000, change: 0 },
];

export const productStatus = (stock) => {
  if (stock <= 0) return { label: 'Habis', tone: 'bg-red-100 text-red-700 border-red-200' };
  if (stock <= 10) return { label: 'Hampir Habis', tone: 'bg-amber-100 text-amber-700 border-amber-200' };
  return { label: 'Tersedia', tone: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
};
