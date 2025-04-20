import http from "http";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const EDGE_ID = process.env.EDGE_ID || "default";
const PORT = process.env.PORT || 400;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const originURL = "http://localhost:3000";
const cacheDir = join(__dirname, "cache", `edge-${EDGE_ID}`);

const server = http.createServer(async (req, res) => {
  const filepath = req.url === "/" ? "/index.html" : req.url;
  const cachePath = join(cacheDir, filepath);

  fs.mkdirSync(dirname(cachePath), { recursive: true });

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

function getContentType(path){
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.css')) return 'text/css';
  return 'text/plain'
}
server.listen(PORT);
