import http from "http";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { parse as urlParse } from "url";
import fetch from "node-fetch";
import mime from "mime-types";


const EDGE_ID = process.env.EDGE_ID || "default";
const PORT = process.env.PORT || 400;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const originURL = "http://localhost:3000";
const cacheDir = join(__dirname, "cache", `edge-${EDGE_ID}`);

const server = http.createServer(async (req, res) => {
  const parsed = urlParse(req.url);
  const filepath = parsed.pathname === "/" ? "/index.html" : parsed.pathname;
  const cachePath = join(cacheDir, filepath);

  try{
    await fs.mkdir(cacheDir, { recursive: true });
    const cached = await fs.readFile(cachePath);
    console.log(`[${EDGE_ID}] Cache HIT: ${filepath}`);
    res.writeHead(200, { "content-type" : mime.contentType(filepath) || "plaapplication/octet-streamin" });
    res.end(cached);
  }catch{
    try{
      const response = await fetch(originURL + filepath);
      if (!response.ok) {
        throw new Error(`Origin returned ${response.status}`);
      }
      const data = await response.text();
      await fs.mkdir(dirname(cachePath), { recursive: true });
      await fs.writeFile(cachePath, data);
      console.log(`[${EDGE_ID}] Cache MISS: ${filepath} → fetched from origin`);
      res.writeHead(200, { "content-type" : mime.contentType(filepath) || "plaapplication/octet-streamin" });
      res.end(data);
    }catch(err) {
      console.log(`[${EDGE_ID}] Cache MISS: ${filepath} -> ${err.message}`);
      res.writeHead(500, { "content-type": "text/plain" });
      res.end("Error fetching the resource from the main-server");
    }
  }

  fs.readFile(cachePath,'utf-8', async (err, data) => {
    if (!err) {
      res.writeHead(200, { "content-type": getContentType(filepath) });
      res.end(data);
    } else {
      try {
        const data = await fetch(originURL + filepath);
        const body = await data.text();

        //cache the content
        fs.writeFile(cachePath, body, (err) => {
          if(err) console.log('Error caching: ', err)
        });

        res.writeHead(200, { "content-type": getContentType(filepath) });
        res.end(body);
      } catch (err) {
        res.writeHead(500, { "content-type": "text/plain" });
        console.log("Failed to fetch the resources", err);
        res.end("Error fetching the resource from the main-server");
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`[${EDGE_ID}] Edge server running on port ${PORT}`);
});
