const { createApp } = require('./app');

const port = process.env.PORT || 3000;
createApp().listen(port, () => {
  console.log(`order-api listening on port ${port}`);
});
