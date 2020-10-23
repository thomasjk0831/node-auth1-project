const express = require('express')
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session); // for saving sessions to database
const usersRouter = require("../users/users-router.js");
const authRouter = require("../auth/auth-router.js");
const connection = require("../database/connection.js");
const protected = require("../auth/protected-mw.js");


const server = express();

const sessionConfiguration = {
    name: "monster", // defaults to sid for the cookie name
    secret: process.env.SESSION_SECRET || "keep it secret, keep it safe!",
    cookie: {
        httpOnly: true, // true means JS can't access the cookie
        maxAge: 1000 * 60 * 10, // expires after 10 mins
        secure: process.env.SECURE_COOKIES || false, // true means send cookies over https only
    },
    resave: false, // re save the session information even if there are no changes
    saveUninitialized: true, // read about GDPR compliance
    store: new KnexSessionStore({
        knex: connection, // connection to the database
        tablename: "sessions",
        sidfieldname: "sid", // name of session id column
        createtable: true, // if the table doesn't exist, create it
        clearInterval: 1000 * 60 * 60, // remove expired sessions from the database every hour
    }),
};

server.use(helmet());

server.use(express.json())
server.use(cors());
server.use(session(sessionConfiguration));

server.get('/', (req,res)=> {
    res.json({msg: "api up"});
})

server.use("/api/auth", authRouter);
server.use("/api/users", protected, usersRouter);

module.exports = server;