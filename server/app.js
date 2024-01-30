const express = require('express');
const app = express();
const PORT = 5000;
const cors = require('cors');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
const mongoose = require('mongoose');
const { MONGOURL } = require('./key');

require('./models/user');
app.use(cors());
app.use(express.static('../public')); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.json());
app.use(require('./routes/auth'));

mongoose.connect(MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to mongodb');
});

mongoose.connection.on('error', () => {
  console.log('Error !!');
});

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('Server is running on', PORT);
});
