/**
 * SCRIPT: Security Verification Checker
 * 
 * Usage:
 *   node scripts/verify-security.js
 * 
 * This checks if all critical security measures are in place
 */

const fs = require('fs')
const path = require('path')

console.log('='.repeat(70))
console.log('🔒 SECURITY VERIFICATION CHECK')
console.log('='.repeat(70))
console.log('')

let passed = 0
let failed = 0
let warnings = 0

function checkPass(name) {
  console.log(`✅ PASS: ${name}`)
  passed++
}

function checkFail(name, fix) {
  console.log(`❌ FAIL: ${name}`)
  console.log(`   Fix: ${fix}`)
  failed++
}

function checkWarn(name, note) {
  console.log(`⚠️  WARN: ${name}`)
  console.log(`   Note: ${note}`)
  warnings++
}

// Check 1: .env.local not tracked by git
console.log('\n📁 Checking git configuration...')
const gitignorePath = path.join(__dirname, '../.gitignore')
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8')
  if (gitignore.includes('.env.local') || gitignore.includes('.env*.local')) {
    checkPass('.env.local is in .gitignore')
  } else {
    checkFail('.env.local NOT in .gitignore', 'Add ".env*.local" to .gitignore')
  }
} else {
  checkFail('.gitignore not found', 'Create .gitignore file')
}

// Check 2: JWT_SECRET is set
console.log('\n🔑 Checking environment variables...')
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

if (process.env.JWT_SECRET) {
  if (process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
    checkFail('JWT_SECRET is using default value', 'Generate strong secret with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"')
  } else if (process.env.JWT_SECRET.length < 32) {
    checkWarn('JWT_SECRET is too short', 'Recommended minimum 32 characters')
  } else {
    checkPass('JWT_SECRET is set with strong value')
  }
} else {
  checkFail('JWT_SECRET is not set', 'Add JWT_SECRET to .env.local')
}

// Check 3: Supabase keys
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  checkPass('Supabase credentials are set')
  
  // Check if using example values
  if (process.env.NEXT_PUBLIC_SUPABASE_URL.includes('xxxxx')) {
    checkFail('Using example Supabase URL', 'Update with your actual Supabase project URL')
  }
} else {
  checkFail('Supabase credentials missing', 'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local')
}

// Check 4: bcryptjs installed
console.log('\n📦 Checking dependencies...')
const packageJsonPath = path.join(__dirname, '../package.json')
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  if (packageJson.dependencies && packageJson.dependencies.bcryptjs) {
    checkPass('bcryptjs is installed')
  } else {
    checkFail('bcryptjs not installed', 'Run: npm install bcryptjs')
  }
  
  if (packageJson.dependencies && packageJson.dependencies.zod) {
    checkPass('zod validator is installed')
  } else {
    checkFail('zod not installed', 'Run: npm install zod')
  }
} else {
  checkFail('package.json not found', 'Initialize npm project')
}

// Check 5: Auth file exists
console.log('\n🔐 Checking authentication implementation...')
const authPath = path.join(__dirname, '../lib/auth.js')
const authSecurePath = path.join(__dirname, '../lib/auth-secure.js')

if (fs.existsSync(authSecurePath)) {
  checkPass('Secure auth file (auth-secure.js) exists')
  
  const authContent = fs.readFileSync(authSecurePath, 'utf8')
  if (authContent.includes('bcrypt')) {
    checkPass('Using bcrypt for password hashing')
  } else {
    checkFail('bcrypt not used in auth', 'Implement bcrypt password hashing')
  }
  
  if (authContent.includes('validPasswords') || authContent.includes("'123'")) {
    checkFail('Still using hardcoded passwords', 'Remove hardcoded passwords from auth file')
  } else {
    checkPass('No hardcoded passwords found')
  }
} else if (fs.existsSync(authPath)) {
  checkWarn('Using old auth.js file', 'Migrate to auth-secure.js with bcrypt')
  
  const authContent = fs.readFileSync(authPath, 'utf8')
  if (authContent.includes("'123'") || authContent.includes('validPasswords')) {
    checkFail('Hardcoded passwords found in auth.js', 'CRITICAL: Implement proper password hashing')
  }
} else {
  checkFail('No auth file found', 'Create lib/auth-secure.js with proper authentication')
}

// Check 6: API validation
console.log('\n🛡️  Checking API security...')
const productsApiPath = path.join(__dirname, '../app/api/products/route.js')
if (fs.existsSync(productsApiPath)) {
  const apiContent = fs.readFileSync(productsApiPath, 'utf8')
  
  if (apiContent.includes('verifyAuth')) {
    checkPass('API authentication check exists')
  } else {
    checkFail('No authentication on products API', 'Add verifyAuth() to all API routes')
  }
  
  if (apiContent.includes('validateForm') || apiContent.includes('productSchema')) {
    checkPass('Input validation implemented')
  } else {
    checkFail('No input validation on API', 'Add zod schema validation to API routes')
  }
} else {
  checkWarn('Products API not found', 'API file location may have changed')
}

// Check 7: Seed endpoint protection
console.log('\n🌱 Checking seed endpoint...')
const seedApiPath = path.join(__dirname, '../app/api/seed/route.js')
if (fs.existsSync(seedApiPath)) {
  const seedContent = fs.readFileSync(seedApiPath, 'utf8')
  
  if (seedContent.includes("process.env.NODE_ENV === 'production'") || 
      seedContent.includes('verifyAuth')) {
    checkPass('Seed endpoint is protected')
  } else {
    checkFail('Seed endpoint not protected', 'Add production check or authentication to seed route')
  }
} else {
  checkPass('No seed endpoint found (good for production)')
}

// Check 8: Security headers
console.log('\n📋 Checking security configuration...')
const nextConfigPath = path.join(__dirname, '../next.config.js')
if (fs.existsSync(nextConfigPath)) {
  const configContent = fs.readFileSync(nextConfigPath, 'utf8')
  
  if (configContent.includes('X-Content-Type-Options')) {
    checkPass('Security headers configured')
  } else {
    checkWarn('Security headers not configured', 'Add security headers in next.config.js')
  }
  
  if (configContent.includes('Content-Security-Policy')) {
    checkPass('CSP header configured')
  } else {
    checkWarn('CSP not configured', 'Consider adding Content-Security-Policy')
  }
} else {
  checkFail('next.config.js not found', 'Create Next.js configuration file')
}

// Summary
console.log('\n' + '='.repeat(70))
console.log('📊 VERIFICATION SUMMARY')
console.log('='.repeat(70))
console.log('')
console.log(`✅ Passed:   ${passed}`)
console.log(`⚠️  Warnings: ${warnings}`)
console.log(`❌ Failed:   ${failed}`)
console.log('')

if (failed === 0 && warnings === 0) {
  console.log('🎉 EXCELLENT! All security checks passed!')
  console.log('✅ Your application is ready for production deployment.')
} else if (failed === 0) {
  console.log('✅ GOOD! All critical checks passed.')
  console.log('⚠️  Address warnings to improve security further.')
} else if (failed <= 3) {
  console.log('⚠️  WARNING! Some critical issues found.')
  console.log('🔧 Fix failed checks before deploying to production.')
} else {
  console.log('❌ CRITICAL! Multiple security issues found.')
  console.log('🚫 DO NOT deploy to production until all issues are fixed!')
}

console.log('')
console.log('📖 For detailed fixes, see:')
console.log('   - PANDUAN_PERBAIKAN_KEAMANAN.md')
console.log('   - LAPORAN_AUDIT_KEAMANAN.md')
console.log('')
console.log('='.repeat(70))
console.log('')

// Exit code
process.exit(failed > 0 ? 1 : 0)