import { supabase, productsApi, customersApi } from '@/lib/supabase'

const SAMPLE_PRODUCTS = [
  {
    barcode: '8998009010019',
    name: 'Ultra Milk Full Cream 250ml',
    category: 'Susu UHT',
    buy_price: 5000,
    sell_price: 7500,
    stock: 47,
    stock_min: 10,
    status: 'available'
  },
  {
    barcode: '8998009010026',
    name: 'Ultra Milk Coklat 250ml',
    category: 'Susu UHT',
    buy_price: 5000,
    sell_price: 7500,
    stock: 36,
    stock_min: 10,
    status: 'available'
  },
  {
    barcode: '8992775311010',
    name: 'Indomilk Putih 190ml',
    category: 'Susu UHT',
    buy_price: 3500,
    sell_price: 5500,
    stock: 60,
    stock_min: 15,
    status: 'available'
  },
  {
    barcode: '8992775311027',
    name: 'Indomilk Stroberi 190ml',
    category: 'Susu UHT',
    buy_price: 3500,
    sell_price: 5500,
    stock: 24,
    stock_min: 15,
    status: 'available'
  },
  {
    barcode: '8999999019013',
    name: 'Milo UHT 180ml',
    category: 'Minuman',
    buy_price: 4000,
    sell_price: 6000,
    stock: 8,
    stock_min: 20,
    status: 'low_stock'
  },
  {
    barcode: '8992696404014',
    name: 'Bear Brand 189ml',
    category: 'Susu UHT',
    buy_price: 7000,
    sell_price: 11000,
    stock: 30,
    stock_min: 10,
    status: 'available'
  },
  {
    barcode: '8997016800012',
    name: 'Greenfields Full Cream 250ml',
    category: 'Susu UHT',
    buy_price: 8000,
    sell_price: 12500,
    stock: 18,
    stock_min: 10,
    status: 'available'
  },
  {
    barcode: '8998209010039',
    name: 'Ultra Milk Strawberry 250ml',
    category: 'Susu UHT',
    buy_price: 5000,
    sell_price: 7500,
    stock: 42,
    stock_min: 10,
    status: 'available'
  },
  {
    barcode: '8998209010046',
    name: 'Ultra Milk Vanilla 250ml',
    category: 'Susu UHT',
    buy_price: 5000,
    sell_price: 7500,
    stock: 35,
    stock_min: 10,
    status: 'available'
  },
  {
    barcode: '8988000100037',
    name: 'Frisian Flag Coklat Kaleng',
    category: 'Susu Kental Manis',
    buy_price: 2500,
    sell_price: 4500,
    stock: 0,
    stock_min: 20,
    status: 'out_of_stock'
  },
  {
    barcode: '8996001100641',
    name: 'Cimory Yogurt Drink 250ml',
    category: 'Yogurt',
    buy_price: 3000,
    sell_price: 5500,
    stock: 5,
    stock_min: 15,
    status: 'low_stock'
  },
  {
    barcode: '8992770500010',
    name: 'Keju Cheddar 200g',
    category: 'Dairy',
    buy_price: 15000,
    sell_price: 22000,
    stock: 12,
    stock_min: 5,
    status: 'available'
  }
]

const SAMPLE_CUSTOMERS = [
  {
    name: 'Ahmad Riyadi',
    phone: '081234567890',
    email: 'ahmad@email.com',
    address: 'Jl. Merdeka No. 123, Jakarta',
    status: 'member',
    points: 5000,
    total_spent: 500000
  },
  {
    name: 'Siti Nurhaliza',
    phone: '082345678901',
    email: 'siti@email.com',
    address: 'Jl. Sudirman No. 456, Jakarta',
    status: 'member',
    points: 3500,
    total_spent: 350000
  },
  {
    name: 'Budi Santoso',
    phone: '083456789012',
    email: 'budi@email.com',
    address: 'Jl. Gatot Subroto No. 789, Jakarta',
    status: 'member',
    points: 2000,
    total_spent: 200000
  },
  {
    name: 'Dewi Lestari',
    phone: '084567890123',
    email: 'dewi@email.com',
    address: 'Jl. Ahmad Yani No. 321, Jakarta',
    status: 'regular',
    points: 0,
    total_spent: 0
  },
  {
    name: 'Rina Wijaya',
    phone: '085678901234',
    email: 'rina@email.com',
    address: 'Jl. Diponegoro No. 654, Jakarta',
    status: 'member',
    points: 7500,
    total_spent: 750000
  }
]

export async function POST() {
  try {
    // Check if data already exists
    const { data: existingProducts } = await supabase
      .from('products')
      .select('id')
      .limit(1)

    if (existingProducts && existingProducts.length > 0) {
      return Response.json(
        { success: false, message: 'Data sudah ada. Skip seeding.' },
        { status: 400 }
      )
    }

    // Insert products
    const { data: productData, error: productError } = await supabase
      .from('products')
      .insert(SAMPLE_PRODUCTS)
      .select()

    if (productError) throw productError

    // Insert customers
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert(SAMPLE_CUSTOMERS)
      .select()

    if (customerError) throw customerError

    return Response.json({
      success: true,
      message: 'Data seeding berhasil!',
      products: productData?.length || 0,
      customers: customerData?.length || 0
    })
  } catch (error) {
    console.error('Seed error:', error)
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
