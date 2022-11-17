const mongoose = require('mongoose');
const {MONGODB_URL} = process.env;

exports.connect = () => {
    mongoose.connect(MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(
            console.log('Connected to MongoDB')
        )
        .catch(err => {
            console.log('DB CONNECTION ERROR')
            console.log(err)
            process.exit(1)
        })
}
