/**
 * Script untuk menghapus semua data dari database
 * Jalankan dengan: node scripts/clear-data.js
 * HATI-HATI: Script ini akan menghapus SEMUA data!
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

async function clearData() {
  console.log('⚠️  PERINGATAN: Script ini akan menghapus SEMUA data!\n')
  console.log('🗑️  Mulai menghapus data...\n')

  try {
    // 1. Delete Transactions
    console.log('💰 Menghapus transaksi...')
    const { error: transactionsError } = await supabase
      .from('transactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (transactionsError) {
      console.error('❌ Error deleting transactions:', transactionsError.message)
    } else {
      console.log('✅ Transaksi berhasil dihapus')
    }

    // 2. Delete Customers
    console.log('\n👥 Menghapus pelanggan...')
    const { error: customersError } = await supabase
      .from('customers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (customersError) {
      console.error('❌ Error deleting customers:', customersError.message)
    } else {
      console.log('✅ Pelanggan berhasil dihapus')
    }

    // 3. Delete Products
    console.log('\n📦 Menghapus produk...')
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (productsError) {
      console.error('❌ Error deleting products:', productsError.message)
    } else {
      console.log('✅ Produk berhasil dihapus')
    }

    console.log('\n✨ Semua data berhasil dihapus!')
    console.log('\n💡 Jalankan "node scripts/seed-data.js" untuk menambahkan data baru')

  } catch (error) {
    console.error('\n❌ Error during clearing:', error.message)
    process.exit(1)
  }
}

// Run clearing
clearData()
