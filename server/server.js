const app = require('./app/app.js');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'dev'})`);
});