import { Schema, model } from "mongoose";

const VendorSchema=new Schema({
    vendorName:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true,minlength:6},
    bills:[{type:Schema.Types.ObjectId,ref:'Bills'}]
})

export default model('Vendors',VendorSchema)