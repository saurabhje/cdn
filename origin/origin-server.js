import http from 'http';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the paths to the static files
const indexHtml = join(__dirname, 'public', 'index.html');
const cssPath = join(__dirname, 'public', 'style.css');
const reqHtml = join(__dirname, 'public', 'request.html')

//creating the server instance
const server = http.createServer( async (req, res) => {
  try{
    let filepath;
    let contentType = 'text/plain';
  
    if (req.url === '/' || req.url === '/index.html') {
      filepath = indexHtml;
      contentType = 'text/html';
    }
    else if (req.url === '/req.html'){
      filepath = reqHtml;
    }
    else if (req.url === '/style.css') {
      filepath = cssPath;
      contentType = 'text/css';
    }
    else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  
    await new Promise(res => setTimeout(res, 1500));
    const data = await fs.readFile(filepath, 'utf-8')
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
    console.log(`Served ${req.url} with content type ${contentType}`);
  }catch(err) {
    console.error(`Error serving ${req.url}:`, err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});


server.listen(3000, () => {
  console.log('Origin server running on port 3000');
});
