const express =require('express');
const bodyParser =require('body-parser');
const cors = require('cors');
const app =express();
const route=require('./routes');

app.use(bodyParser.json());
app.use(cors(
    {
        origin:'*'
    }
));
app.use('/',route);


  
module.exports =app;
