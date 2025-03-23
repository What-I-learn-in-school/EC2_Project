const express = require('express');
const app = express();

app.use(express.static('./views'))
app.set('view engine', 'ejs');
app.set('views', './views');

// Dynamo
const AWS = require('aws-sdk');
const config = new AWS.Config(configAWS)

AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = 'dynamoDB';

// Multer
const multer = require('multer');
const { configAWS } = require('./env');

const upload = multer();


app.get('/', (req, res) => {

    const params = {
        TableName: tableName,
    }

    docClient.scan(params, (err, data) => {
        if (err){
            res.send("Internal Server Error")
        } else {
            return res.render('index', {dynamoDB: data.Items});
        }
    })
});


app.post('/', upload.fields([]), (req, res) => {
    const {ma_sp, ten_sp, so_luong} = req.body;

    const params = {
        TableName: tableName,
        Item: {
            "ma_sp": ma_sp,
            "ten_sp": ten_sp,
            "so_luong": so_luong
        }
    }
    
    docClient.put(params, (err, data) => {
        if (err){
            console.log(err)
            return res.send("Internal Server Error")
        } else {
           return res.redirect("/")
        }
    })

})

app.post("/delete", upload.fields([]), (req, res) => {
    const listItems = Object.keys(req.body);

    if (listItems.length === 0) {
        return res.redirect("/");
    }

    function onDeleteItem(index) {
        const params = {
            TableName: tableName,
            Key: {
                "ma_sp": listItems[index]
            }
        }

        docClient.delete(params, (err, data) => {
            if (err) {
                return res.send("Internal Server Error")
            }
            else {
                if (index > 0) {
                    onDeleteItem(index -1);
                } else {
                    return res.redirect("/")
                }
            }
        })
    }

    onDeleteItem(listItems.length -1)
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
