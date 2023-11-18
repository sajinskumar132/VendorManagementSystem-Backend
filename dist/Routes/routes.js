"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vendorController_1 = require("../controllers/vendorController");
const billController_1 = require("../controllers/billController");
const route = express_1.default.Router();
route.post('/signup', vendorController_1.SignUp);
route.post('/login', vendorController_1.Login);
route.get('/bills', billController_1.Bills);
route.get('/:id/bills', billController_1.BillByVendor);
route.post('/newbill', billController_1.NewBill);
route.patch('/:id/updatePayment', billController_1.updatePayment);
route.patch('/:id/updatebill', billController_1.updateBill);
route.delete('/:id/deletebill', billController_1.deleteBill);
exports.default = route;
