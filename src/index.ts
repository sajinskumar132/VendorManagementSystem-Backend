import express from 'express'
import { config } from 'dotenv'
import { DbConnect } from './connection/dbConnection'
import cors from 'cors'
import route from './Routes/routes'
config()

const app=express()
app.use(cors())
app.use(express.json())

app.use('/',route)
const StartServer=()=>{
    try {
        DbConnect().then(()=>{
            app.listen(process.env.PORT,()=>{
                console.log('server Started')
            })
        })
    } catch (error) {
        console.log(error)
    }
}

StartServer()

