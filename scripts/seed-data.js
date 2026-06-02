/**
 * Script untuk menambahkan data demo ke database
 * Jalankan dengan: node scripts/seed-data.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Data Produk Susu
const products = [
  {
    barcode: '8992753600016',
    name: 'Ultra Milk Full Cream 250ml',
    category: 'Susu UHT',
    buy_price: 6000,
    sell_price: 7500,
    stock: 50,
    unit: 'pcs'
  },
  {
    barcode: '8992753600023',
    name: 'Ultra Milk Coklat 250ml',
    category: 'Susu UHT',
    buy_price: 6000,
    sell_price: 7500,
    stock: 45,
    unit: 'pcs'
  },
  {
    barcode: '8992753600030',
    name: 'Ultra Milk Stroberi 250ml',
    category: 'Susu UHT',
    buy_price: 6000,
    sell_price: 7500,
    stock: 40,
    unit: 'pcs'
  },
  {
    barcode: '8992745100014',
    name: 'Indomilk Putih 190ml',
    category: 'Susu UHT',
    buy_price: 4500,
    sell_price: 5500,
    stock: 60,
    unit: 'pcs'
  },
  {
    barcode: '8992745100021',
    name: 'Indomilk Coklat 190ml',
    category: 'Susu UHT',
    buy_price: 4500,
    sell_price: 5500,
    stock: 55,
    unit: 'pcs'
  },
  {
    barcode: '8992745100038',
    name: 'Indomilk Stroberi 190ml',
    category: 'Susu UHT',
    buy_price: 4500,
    sell_price: 5500,
    stock: 50,
    unit: 'pcs'
  },
  {
    barcode: '8992696100015',
    name: 'Milo UHT 180ml',
    category: 'Minuman',
    buy_price: 5000,
    sell_price: 6500,
    stock: 48,
    unit: 'pcs'
  },
  {
    barcode: '8992696100022',
    name: 'Milo Activ-Go 180ml',
    category: 'Minuman',
    buy_price: 5500,
    sell_price: 7000,
    stock: 42,
    unit: 'pcs'
  },
  {
    barcode: '8992696200016',
    name: 'Bear Brand 189ml',
    category: 'Susu Steril',
    buy_price: 9500,
    sell_price: 11500,
    stock: 35,
    unit: 'pcs'
  },
  {
    barcode: '8992696200023',
    name: 'Bear Brand Gold 189ml',
    category: 'Susu Steril',
    buy_price: 10500,
    sell_price: 12500,
    stock: 30,
    unit: 'pcs'
  },
  {
    barcode: '8992753700017',
    name: 'Greenfields Full Cream 250ml',
    category: 'Susu UHT',
    buy_price: 10000,
    sell_price: 12500,
    stock: 38,
    unit: 'pcs'
  },
  {
    barcode: '8992753700024',
    name: 'Greenfields Low Fat 250ml',
    category: 'Susu UHT',
    buy_price: 10500,
    sell_price: 13000,
    stock: 32,
    unit: 'pcs'
  },
  {
    barcode: '8992745200015',
    name: 'Frisian Flag Purefarm 225ml',
    category: 'Susu UHT',
    buy_price: 5500,
    sell_price: 7000,
    stock: 52,
    unit: 'pcs'
  },
  {
    barcode: '8992745200022',
    name: 'Frisian Flag Coklat 225ml',
    category: 'Susu UHT',
    buy_price: 5500,
    sell_price: 7000,
    stock: 48,
    unit: 'pcs'
  },
  {
    barcode: '8992696300017',
    name: 'Dancow Fortigro Instant 800g',
    category: 'Susu Bubuk',
    buy_price: 65000,
    sell_price: 78000,
    stock: 15,
    unit: 'box'
  },
  {
    barcode: '8992696300024',
    name: 'Dancow Fortigro Coklat 800g',
    category: 'Susu Bubuk',
    buy_price: 68000,
    sell_price: 82000,
    stock: 12,
    unit: 'box'
  },
  {
    barcode: '8992753800018',
    name: 'Yogurt Cimory Plain 120ml',
    category: 'Yogurt',
    buy_price: 6000,
    sell_price: 8000,
    stock: 28,
    unit: 'pcs'
  },
  {
    barcode: '8992753800025',
    name: 'Yogurt Cimory Stroberi 120ml',
    category: 'Yogurt',
    buy_price: 6000,
    sell_price: 8000,
    stock: 25,
    unit: 'pcs'
  },
  {
    barcode: '8992753800032',
    name: 'Yogurt Cimory Blueberry 120ml',
    category: 'Yogurt',
    buy_price: 6500,
    sell_price: 8500,
    stock: 22,
    unit: 'pcs'
  },
  {
    barcode: '8992745300016',
    name: 'Keju Kraft Cheddar 165g',
    category: 'Keju & Butter',
    buy_price: 28000,
    sell_price: 35000,
    stock: 18,
    unit: 'pcs'
  }
]

// Data Pelanggan
const customers = [
  {
    name: 'Budi Santoso',
    phone: '081234567890',
    email: 'budi.santoso@email.com',
    address: 'Jl. Merdeka No. 123, Jakarta Pusat',
    points: 150,
    total_tx: 12,
    total_spent: 450000
  },
  {
    name: 'Siti Nurhaliza',
    phone: '081234567891',
    email: 'siti.nur@email.com',
    address: 'Jl. Sudirman No. 45, Jakarta Selatan',
    points: 280,
    total_tx: 25,
    total_spent: 850000
  },
  {
    name: 'Ahmad Wijaya',
    phone: '081234567892',
    email: 'ahmad.w@email.com',
    address: 'Jl. Gatot Subroto No. 78, Jakarta Barat',
    points: 95,
    total_tx: 8,
    total_spent: 320000
  },
  {
    name: 'Dewi Lestari',
    phone: '081234567893',
    email: 'dewi.lestari@email.com',
    address: 'Jl. Thamrin No. 56, Jakarta Pusat',
    points: 420,
    total_tx: 35,
    total_spent: 1250000
  },
  {
    name: 'Rudi Hartono',
    phone: '081234567894',
    email: 'rudi.h@email.com',
    address: 'Jl. Kuningan No. 89, Jakarta Selatan',
    points: 180,
    total_tx: 15,
    total_spent: 580000
  },
  {
    name: 'Linda Kusuma',
    phone: '081234567895',
    email: 'linda.k@email.com',
    address: 'Jl. Rasuna Said No. 34, Jakarta Selatan',
    points: 310,
    total_tx: 28,
    total_spent: 950000
  },
  {
    name: 'Eko Prasetyo',
    phone: '081234567896',
    email: 'eko.p@email.com',
    address: 'Jl. HR Rasuna Said No. 12, Jakarta Timur',
    points: 65,
    total_tx: 5,
    total_spent: 210000
  },
  {
    name: 'Maya Sari',
    phone: '081234567897',
    email: 'maya.sari@email.com',
    address: 'Jl. Senopati No. 67, Jakarta Selatan',
    points: 520,
    total_tx: 42,
    total_spent: 1680000
  }
]

async function seedData() {
  console.log('🌱 Mulai seeding data...\n')

  try {
    // 1. Insert Products
    console.log('📦 Menambahkan produk...')
    const { data: insertedProducts, error: productsError } = await supabase
      .from('products')
      .insert(products)
      .select()

    if (productsError) {
      console.error('❌ Error inserting products:', productsError.message)
    } else {
      console.log(`✅ Berhasil menambahkan ${insertedProducts.length} produk`)
    }

    // 2. Insert Customers
    console.log('\n👥 Menambahkan pelanggan...')
    const { data: insertedCustomers, error: customersError } = await supabase
      .from('customers')
      .insert(customers)
      .select()

    if (customersError) {
      console.error('❌ Error inserting customers:', customersError.message)
    } else {
      console.log(`✅ Berhasil menambahkan ${insertedCustomers.length} pelanggan`)
    }

    // 3. Create Sample Transactions
    if (insertedProducts && insertedCustomers && insertedProducts.length > 0 && insertedCustomers.length > 0) {
      console.log('\n💰 Menambahkan transaksi contoh...')
      
      const transactions = [
        {
          no: `TRX-${Date.now()}-001`,
          customer_id: insertedCustomers[0].id,
          customer_name: insertedCustomers[0].name,
          items: [
            {
              product_id: insertedProducts[0].id,
              barcode: insertedProducts[0].barcode,
              name: insertedProducts[0].name,
              quantity: 2,
              price: insertedProducts[0].sell_price,
              subtotal: insertedProducts[0].sell_price * 2
            },
            {
              product_id: insertedProducts[3].id,
              barcode: insertedProducts[3].barcode,
              name: insertedProducts[3].name,
              quantity: 3,
              price: insertedProducts[3].sell_price,
              subtotal: insertedProducts[3].sell_price * 3
            }
          ],
          item_count: 5,
          subtotal: (insertedProducts[0].sell_price * 2) + (insertedProducts[3].sell_price * 3),
          discount: 0,
          tax: ((insertedProducts[0].sell_price * 2) + (insertedProducts[3].sell_price * 3)) * 0.1,
          total: ((insertedProducts[0].sell_price * 2) + (insertedProducts[3].sell_price * 3)) * 1.1,
          payment_method: 'tunai',
          paid: 50000,
          change: 50000 - (((insertedProducts[0].sell_price * 2) + (insertedProducts[3].sell_price * 3)) * 1.1)
        },
        {
          no: `TRX-${Date.now()}-002`,
          customer_id: insertedCustomers[1].id,
          customer_name: insertedCustomers[1].name,
          items: [
            {
              product_id: insertedProducts[6].id,
              barcode: insertedProducts[6].barcode,
              name: insertedProducts[6].name,
              quantity: 4,
              price: insertedProducts[6].sell_price,
              subtotal: insertedProducts[6].sell_price * 4
            }
          ],
          item_count: 4,
          subtotal: insertedProducts[6].sell_price * 4,
          discount: 2000,
          tax: (insertedProducts[6].sell_price * 4 - 2000) * 0.1,
          total: (insertedProducts[6].sell_price * 4 - 2000) * 1.1,
          payment_method: 'qris',
          paid: (insertedProducts[6].sell_price * 4 - 2000) * 1.1,
          change: 0
        },
        {
          no: `TRX-${Date.now()}-003`,
          customer_id: null,
          customer_name: 'Umum (Tanpa Member)',
          items: [
            {
              product_id: insertedProducts[8].id,
              barcode: insertedProducts[8].barcode,
              name: insertedProducts[8].name,
              quantity: 1,
              price: insertedProducts[8].sell_price,
              subtotal: insertedProducts[8].sell_price
            },
            {
              product_id: insertedProducts[1].id,
              barcode: insertedProducts[1].barcode,
              name: insertedProducts[1].name,
              quantity: 2,
              price: insertedProducts[1].sell_price,
              subtotal: insertedProducts[1].sell_price * 2
            }
          ],
          item_count: 3,
          subtotal: insertedProducts[8].sell_price + (insertedProducts[1].sell_price * 2),
          discount: 0,
          tax: (insertedProducts[8].sell_price + (insertedProducts[1].sell_price * 2)) * 0.1,
          total: (insertedProducts[8].sell_price + (insertedProducts[1].sell_price * 2)) * 1.1,
          payment_method: 'tunai',
          paid: 35000,
          change: 35000 - ((insertedProducts[8].sell_price + (insertedProducts[1].sell_price * 2)) * 1.1)
        }
      ]

      const { data: insertedTransactions, error: transactionsError } = await supabase
        .from('transactions')
        .insert(transactions)
        .select()

      if (transactionsError) {
        console.error('❌ Error inserting transactions:', transactionsError.message)
      } else {
        console.log(`✅ Berhasil menambahkan ${insertedTransactions.length} transaksi`)
      }
    }

    console.log('\n✨ Seeding selesai!\n')
    console.log('📊 Ringkasan:')
    console.log(`   - ${insertedProducts?.length || 0} produk`)
    console.log(`   - ${insertedCustomers?.length || 0} pelanggan`)
    console.log(`   - 3 transaksi contoh`)
    console.log('\n🎉 Data siap digunakan!')

  } catch (error) {
    console.error('\n❌ Error during seeding:', error.message)
    process.exit(1)
  }
}

// Run seeding
seedData()
