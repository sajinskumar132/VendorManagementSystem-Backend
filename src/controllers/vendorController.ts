import { RequestHandler } from "express";
import Vendor from '../models/vendorModel'
import {compareSync, hashSync} from 'bcryptjs'
import jwt from 'jsonwebtoken'
export const SignUp:RequestHandler=async (req,res,next)=>{
    try {
        const {vendorName,email,password}=req.body
        const existingVendor=await Vendor.findOne({email})
        if(existingVendor) return res.status(400).json({data:null,message:`User with ${email} already exists`})
        const errors=[]
         if(!vendorName.trim()){
            errors.push('Name is required')
         }
         if(!email.trim()){
            errors.push('Email is required')
         }
         if(!password.trim()){
            errors.push('Password is required')
         }else if(password.length<6){
            errors.push('Password length should be minimum of 6')
         }
         if(errors.length>0) return res.status(400).json({data:null,message:errors.toString()})
         const encryptPassword= hashSync(password)
         const newVendor = new Vendor({vendorName,email,password:encryptPassword})
         await newVendor.save()
        if(newVendor){
            const token=jwt.sign({id: newVendor._id},process.env.SeacretKey!,{expiresIn:'7D'})
            const data={
                id:newVendor._id,
                vendorName:newVendor.vendorName,
                email:newVendor.email,
                token
            }
            return res.status(201).json({data:data,message:"Sucessfully Created."})
        }else{
            return res.status(400).json({data:null,message:"Failed to create user."})
        }
    } catch (error) {
        next(error)
        return res.status(500).json({data:null,message:"Internal Server error"})
    }
}

export const Login:RequestHandler=async (req,res,next)=>{
    try {
        const { email,password}=req.body
        const existingVendor= await Vendor.findOne({email})
        if(!existingVendor) return res.status(400).json({data:null,message:`User with ${email} not exists`})
        const errors=[]
         if(!email.trim()){
            errors.push('Email is required')
         }
         if(!password.trim()){
            errors.push('Password is required')
         }
         if(errors.length>0) return res.status(400).json({data:null,message:errors.toString()})
         const isValid=compareSync(password,existingVendor.password)
         if(!isValid) return res.status(400).json({data:null,message:`Incorrect password`})
         const token=jwt.sign({id:existingVendor._id},process.env.SeacretKey!,{expiresIn:'7D'})
         const data={
            id:existingVendor._id,
            vendorName:existingVendor.vendorName,
            email:existingVendor.email,
            token
        }
        return res.status(200).json({data:data,message:"Sucessfully login"})
    } catch (error) {
        next(error)
        return res.status(500).json({data:null,message:"Internal Server error"})
    }
}