import { RequestHandler } from "express";
import { accessTokenAuthenticator } from "../Services/accessTokenAuthenticator";
import Vendor from "../models/vendorModel";
import Bill from "../models/billModel";
import { startSession } from "mongoose";
export const Bills:RequestHandler=async(_,res,next)=>{
    try {
        const bills=await Bill.find()
        if(bills){
            return res.status(200).json({data:bills,message:"Sucessfully get Bills"})
        }else{
            return res.status(400).json({data:null,message:"failed to get Bills"})
        }
    } catch (error) {
        next(error)
        return res.status(500).json({data:null,message:"Internal Server error"})
    }
}

export const BillByVendor:RequestHandler=async(req,res,next)=>{
    try {
        const token=req.headers.authorization?.split(' ')[1]
        if(!token) return res.status(401).json({data:null,message:"Unauthorized"})
        const Vendorid = accessTokenAuthenticator.TokenAuthenticator(token)
        if(!Vendorid) return res.status(401).json({data:null,message:"Unauthorized"})
        let exisingVendor:any=await Vendor.findById(Vendorid).populate('bills')
        if(exisingVendor){
            return res.status(201).json({data:exisingVendor.bills,message:"Sucessfully Get Bill"})
         }else{
            return res.status(400).json({data:null,message:"Failed to Get Bills"})
         }
    } catch (error) {
        next(error)
        return res.status(500).json({data:null,message:"Internal Server error"})
    }
}
export const NewBill:RequestHandler=async (req,res,next)=>{
    const session= await startSession()
    try {
        session.startTransaction({session})
        const token=req.headers.authorization?.split(' ')[1]
        if(!token) return res.status(401).json({data:null,message:"Unauthorized"})
        const Vendorid = accessTokenAuthenticator.TokenAuthenticator(token)
        if(!Vendorid) return res.status(401).json({data:null,message:"Unauthorized"})
        let exisingVendor:any=await Vendor.findById(Vendorid)

        if(!exisingVendor) return res.status(401).json({data:null,message:"Vendor not found"})
        const {invoiceNumber,description,totalAmount}=req.body

        const NewBill=new Bill({vendorName:exisingVendor.vendorName,invoiceNumber,description,totalAmount,totalPaid:0,balaceAmount:totalAmount,paidPercentage:0,status:"Not paid"})
         exisingVendor.bills.push(NewBill)
        await NewBill.save({session})
        if(NewBill){
            await exisingVendor.save({session})
            return res.status(201).json({data:NewBill,message:"Sucessfully created new bill"})
        }else{
            return res.status(400).json({data:null,message:"Failed to create new bill"})
        }
    } catch (error) {
        next(error)
        return res.status(500).json({data:null,message:"Internal Server error"})
    } finally{
        await session.commitTransaction()
    }
}

export const updateBill:RequestHandler=async (req,res,next)=>{
    try {
        const token=req.headers.authorization?.split(' ')[1]
        const {id}= req.params
        if(!token) return res.status(401).json({data:null,message:"Unauthorized"})
        const Vendorid = accessTokenAuthenticator.TokenAuthenticator(token)
        if(!Vendorid) return res.status(401).json({data:null,message:"Unauthorized"})
        const existingBill = await Bill.findById(id);
        if (!existingBill)  return res.status(400).json({ data: null, message: `Bill with this ${id} not found` });
        if(existingBill.status==="Paid") return res.status(400).json({ data: null, message: "Bill has already been paid; please create a new bill." });
        const {description,totalAmount}=req.body
        const percentage = ((existingBill.totalPaid) / existingBill.totalAmount) * 100;
        let UpdateExisingBill=await Bill.findByIdAndUpdate(id,{description,totalAmount,balaceAmount:totalAmount-existingBill.totalPaid,paidPercentage: percentage},{new:true})
         if(UpdateExisingBill){
            return res.status(201).json({data:UpdateExisingBill,message:"Sucessfully updated bill"})
         }else{
            return res.status(400).json({data:null,message:"Updation Failed"})
         }
    } catch (error) {
       next(error)
       return res.status(500).json({data:null,message:"Internal Server error"})
    }
}


export const deleteBill:RequestHandler=async (req,res,next)=>{
    try {
        const token=req.headers.authorization?.split(' ')[1]
        const {id}= req.params
        if(!token) return res.status(401).json({data:null,message:"Unauthorized"})
        const Vendorid = accessTokenAuthenticator.TokenAuthenticator(token)
        if(!Vendorid) return res.status(401).json({data:null,message:"Unauthorized"})
        let deleteBill=await Bill.findByIdAndDelete(id)
        if(deleteBill){
            return res.status(201).json({data:null,message:"Sucessfully deleted bill"})
         }else{
            return res.status(400).json({data:null,message:"Updation Failed"})
         }
    } catch (error) {
        next(error)
        return res.status(500).json({data:null,message:"Internal Server error"})
    }
}

export const updatePayment: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const existingBill = await Bill.findById(id);
        if (!existingBill) {
            return res.status(400).json({ data: null, message: `Bill with this ${id} not found` });
        }
        if (existingBill.totalPaid !== 0 &&  amount <= existingBill.balaceAmount) {
            const percentage = ((existingBill.balaceAmount + amount) / existingBill.totalAmount) * 100;
            const balanceAmount = existingBill.balaceAmount - amount;
            await Bill.findByIdAndUpdate(id, { totalPaid:existingBill.totalPaid+amount, balaceAmount: balanceAmount, paidPercentage: percentage, status: balanceAmount===0?"Paid":"partially Paid" },{new:true});
        } else if (existingBill.totalPaid === 0 && existingBill.totalAmount >= amount) {
            const percentage = (amount / existingBill.totalAmount) * 100;
            const balanceAmount = existingBill.totalAmount - amount;
            await Bill.findByIdAndUpdate(id, { totalPaid:existingBill.totalPaid+amount, balaceAmount: balanceAmount, paidPercentage: percentage, status: balanceAmount===0?"Paid":"partially Paid" },{new:true});
        } else {
            if(existingBill.totalPaid===existingBill.totalAmount) return res.status(400).json({ data: null, message: "Already your bill cleared" })
            if(amount>existingBill.totalAmount) return res.status(400).json({ data: null, message: "The payment amount exceeds the total bill amount. Please pay only the specified amount." })
            if(amount>(existingBill.balaceAmount - amount)) return res.status(400).json({ data: null, message: "The payment amount exceeds the remaining balance. Please pay only the outstanding balance." })
            return res.status(400).json({ data: null, message: "Payment failed" });
        }
        return res.status(200).json({ data: null, message: "Successfully Paid" });

    } catch (error) {
        console.error(error);
        next(error);
        return res.status(500).json({ data: null, message: "Internal Server error" });
    }
};
