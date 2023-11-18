import jwt from 'jsonwebtoken'

export class accessTokenAuthenticator{

    static TokenAuthenticator=(token:string)=>{
        let id
        jwt.verify(token,process.env.SeacretKey!,(err, decoded:any)=>{
            if(!err){
                id= decoded.id
            }
        })
        return id
    } 

}