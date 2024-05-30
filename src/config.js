import { config } from 'dotenv';

const result = config();

export const PORT = process.env.PORT || 3000    
export const DB_HOST = process.env.DB_HOST || 'viaduct.proxy.rlwy.net'
export const DB_PORT = process.env.DB_PORT || 58364
export const DB_USER = process.env.DB_USER || 'root'
export const DB_PASSWORD = process.env.DB_PASSWORD || 'BgEIZJtREybesYDDBBDjqSkLnhdSXacZ'
export const DB_DATABASE = process.env.DB_NAME || 'musemur'
