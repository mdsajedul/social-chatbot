const http = require('http');
const app = require('./src/app');
// const { PORT, dbURI } = require('../config/config');
// const connectDB = require('./db/db');

const server = http.createServer(app);


// connectDB(dbURI).then(()=>{
//     console.log('Database Connected');
//     server.listen(PORT,()=>{
//         console.log(`Server is running on PORT: ${PORT}`)
//     })
// }).catch((e)=>{
//     console.log(e);
// })

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});