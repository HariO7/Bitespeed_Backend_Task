import Express from 'express';

// const express = require("express");
const dotenv = require("dotenv");


dotenv.config();

const app = Express()
const port = process.env.PORT || 3000

app.get('/',(req:Express.Request,res: Express.Response)=>{
    res.send('Express + Typescript server')
})

app.listen(port, ()=>{
    console.log(`[Server]: server is running at port ${port}`);
    
})

