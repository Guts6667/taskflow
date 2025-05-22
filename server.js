import http from 'http';
import app from './app.js';



app.set('port', process.env.PORT || 3000);

const server = http.createServer((req, res) => {
  res.end('Server is running\n');
} );

server.listen(process.env.PORT || 3000, () => {
  console.log(`We're good to go! ✅`);
  console.log(`Server running at http://localhost:${process.env.PORT || 3000}/`);
}
);
