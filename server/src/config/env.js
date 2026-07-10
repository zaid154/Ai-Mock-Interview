const path = require('path')
const dotenv = require('dotenv')

// One shared .env for the whole project, at the repo root (two levels above /server).
// Required first in index.js/seed.js so it runs before anything reads process.env.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
