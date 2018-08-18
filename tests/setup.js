jest.setTimeout(30000);
require('../models/User');
const mongoose = require('mongoose');
const key = require('../config/keys');

mongoose.Promise = global.Promise;
mongoose.connect(key.mongoURI, { useNewUrlParser: true });
