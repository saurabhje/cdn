import http from 'http';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {dirname, join } from 'path';


const EDGE_ID = process.env.EDGE_ID || 'default'
const PORT  = process.env.PORT

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const originURL = 'http://localhost:3000'
const cachePath = join(__dirname, 'cache', `edge-${EDGE_ID}`)


const server =  http.createServer(function (req, res) {
  const filepath = req.url === '/' ? '/index.html' : req.url      
  const cache
})

server.listen(PORT)
