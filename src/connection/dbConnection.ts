import { connect } from "mongoose"

export const DbConnect=async ()=>{
    try {
        await connect(process.env.MongoDbUrl!).then(()=>{
            console.log('DbConnected')
        })
    } catch (error) {
        console.log(error)
    }
}