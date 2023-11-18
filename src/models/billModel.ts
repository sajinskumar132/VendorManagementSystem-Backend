import { Schema, model } from "mongoose";

const BillSchema=new Schema({
    vendorName:{type:String,required:true},
    invoiceNumber:{type:String,required:true},
    description:{type:String,required:true},
    totalAmount:{type:Number,required:true},
    totalPaid:{type:Number,required:true},
    balaceAmount:{type:Number,required:true},
    paidPercentage:{type:Number,required:true},
    status:{type:String,required:true}
},{timestamps:true})

export default model('Bills',BillSchema)