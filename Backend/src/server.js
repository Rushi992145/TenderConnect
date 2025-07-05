const app = require('./app');
const config = require('./config');

app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
}); 