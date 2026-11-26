const path = require('path')
const dotenv = require('dotenv')

// Load server/.env first, with optional fallback to process cwd/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config()
