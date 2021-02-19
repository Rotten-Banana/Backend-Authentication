const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors())

//for selected sites only
// var whitelist = ['http://127.0.0.1:5500', 'http://localhost:5000']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

// // Then pass them to cors:
// app.use(cors(corsOptions));

const db = mysql.createConnection({
    host : 'localhost',
    port : 3306,
    user : 'root',
    password : 'srimani123',
    database : 'sqlwithnode'
});

app.get('/', authenticateToke, (req,res)=>{
    const username = req.user
    let sql = "SELECT * FROM sqlwithnode.post WHERE username=?;"
    db.query(sql, username, (err,result)=>{
        if (err) throw err;
        if (result[0]){
            res.send(result)
        }else res.send([{message:'no post found'}])
    })
})

app.post('/signup', async (req,res)=>{
    try{
        const username = req.body.username;
        let sql = "SELECT username FROM sqlwithnode.login_info WHERE username=?;"
        db.query(sql, username, async (err, result)=>{
            if (err) throw err;
            if (result[0]) return  res.send('username already exist try another one');
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const user = { username: username, password: hashedPassword }
            let sql_insert = `INSERT INTO sqlwithnode.login_info(username,password) VALUES (?,?)`
            db.query(sql_insert, [user.username,user.password],(err,result)=>{
                if (err) throw err;
            })
            const accessToken = jwt.sign(user, 'secretkey')
            res.send(accessToken)
        })
    }catch{
        res.status(500).send(null)
    }
})

app.post('/login', async (req,res)=>{
    try{
        const username = req.body.username;
        let sql = "SELECT * FROM sqlwithnode.login_info WHERE username=?;"
        db.query(sql, username, async (err, result)=>{
            if (err) throw err;
            if (result[0]){
                var user = {username:result[0].username, password:result[0].password}
                if (user){
                    const checkPass = await bcrypt.compare(req.body.password, user.password);
                    if (checkPass){
                        const accessToken = jwt.sign(user, 'secretkey')
                        res.send(accessToken)
                    }else res.send('not found');
                }
            }else res.send('no such user exist')
        })
    }catch{
        res.status(500).send(null)
    }
})

app.post('/post', authenticateToke, (req,res)=>{
    const username = req.user
    const post = req.body
    let sql = `INSERT INTO sqlwithnode.post(username,title,body) VALUES ('${username}','${post.title}','${post.body}')`
    db.query(sql,(err,result)=>{
        if (err) throw err;
        res.status(201).send(null)
    })
})

function authenticateToke(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    if (token == null) return res.status(401)

    jwt.verify(token, 'secretkey', (err,user)=>{
        if (err) return res.status(403)
        req.user = user.username
        next()
    })
}

app.listen(5000,()=>{
    console.log('server is runing on http://localhost:5000')
})