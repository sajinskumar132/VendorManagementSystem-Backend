import express from 'express'
import { Login, SignUp } from '../controllers/vendorController'
import { BillByVendor, Bills, NewBill, deleteBill, updateBill, updatePayment } from '../controllers/billController'

const route=express.Router()

route.post('/signup',SignUp)
route.post('/login',Login)

route.get('/bills',Bills)
route.get('/:id/bills',BillByVendor)

route.post('/newbill',NewBill)
route.patch('/:id/updatePayment',updatePayment)
route.patch('/:id/updatebill',updateBill)

route.delete('/:id/deletebill',deleteBill)

export default route
