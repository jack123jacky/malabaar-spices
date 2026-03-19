require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Connected!'); 
    process.exit(0);
})
.catch(err => {
    console.log('ERROR:', err.message);
    process.exit(1);
});
