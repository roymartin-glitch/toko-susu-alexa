/**
 * SCRIPT: Generate Password Hash for Admin Users
 * 
 * Usage:
 *   node scripts/generate-password-hash.js
 * 
 * This will prompt you to enter a password and generate a bcrypt hash
 * that you can use in auth-secure.js ADMIN_USERS array
 */

const bcrypt = require('bcryptjs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log('='.repeat(60))
console.log('📝 PASSWORD HASH GENERATOR')
console.log('='.repeat(60))
console.log('')

rl.question('Enter password to hash: ', async (password) => {
  if (!password || password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters')
    rl.close()
    return
  }

  try {
    console.log('\n⏳ Generating hash...\n')
    
    const hash = await bcrypt.hash(password, 10)
    
    console.log('✅ Password hash generated successfully!\n')
    console.log('='.repeat(60))
    console.log('📋 COPY THIS HASH TO YOUR CODE:')
    console.log('='.repeat(60))
    console.log('')
    console.log(hash)
    console.log('')
    console.log('='.repeat(60))
    console.log('')
    console.log('📝 Example usage in lib/auth-secure.js:')
    console.log('')
    console.log('const ADMIN_USERS = [')
    console.log('  {')
    console.log('    id: \'1\',')
    console.log('    email: \'admin@toksusu.com\',')
    console.log(`    password: '${hash}',`)
    console.log('    name: \'Administrator\',')
    console.log('    role: \'admin\'')
    console.log('  }')
    console.log(']')
    console.log('')
    console.log('='.repeat(60))
    console.log('')
    console.log('⚠️  SECURITY NOTES:')
    console.log('- Never commit passwords to git')
    console.log('- Change default passwords after first login')
    console.log('- Use strong passwords (min 12 chars, mixed case, numbers, symbols)')
    console.log('- Consider migrating to Supabase Auth for production')
    console.log('')
    
  } catch (error) {
    console.error('❌ Error generating hash:', error.message)
  } finally {
    rl.close()
  }
})

rl.on('close', () => {
  console.log('\n👋 Done!\n')
  process.exit(0)
})
