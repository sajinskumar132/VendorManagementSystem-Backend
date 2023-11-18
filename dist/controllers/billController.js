"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePayment = exports.deleteBill = exports.updateBill = exports.NewBill = exports.BillByVendor = exports.Bills = void 0;
const accessTokenAuthenticator_1 = require("../Services/accessTokenAuthenticator");
const vendorModel_1 = __importDefault(require("../models/vendorModel"));
const billModel_1 = __importDefault(require("../models/billModel"));
const mongoose_1 = require("mongoose");
const Bills = (_, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bills = yield billModel_1.default.find();
        if (bills) {
            return res.status(200).json({ data: bills, message: "Sucessfully get Bills" });
        }
        else {
            return res.status(400).json({ data: null, message: "failed to get Bills" });
        }
    }
    catch (error) {
        next(error);
        return res.status(500).json({ data: null, message: "Internal Server error" });
    }
});
exports.Bills = Bills;
const BillByVendor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token)
            return res.status(401).json({ data: null, message: "Unauthorized" });
        const Vendorid = accessTokenAuthenticator_1.accessTokenAuthenticator.TokenAuthenticator(token);
        if (!Vendorid)
            return res.status(401).json({ data: null, message: "Unauthorized" });
        let exisingVendor = yield vendorModel_1.default.findById(Vendorid).populate('bills');
        if (exisingVendor) {
            return res.status(201).json({ data: exisingVendor.bills, message: "Sucessfully Get Bill" });
        }
        else {
            return res.status(400).json({ data: null, message: "Failed to Get Bills" });
        }
    }
    catch (error) {
        next(error);
        return res.status(500).json({ data: null, message: "Internal Server error" });
    }
});
exports.BillByVendor = BillByVendor;
const NewBill = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const session = yield (0, mongoose_1.startSession)();
    try {
        session.startTransaction({ session });
        const token = (_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(' ')[1];
        if (!token)
            return res.status(401).json({ data: null, message: "Unauthorized" });
        const Vendorid = accessTokenAuthenticator_1.accessTokenAuthenticator.TokenAuthenticator(token);
        if (!Vendorid)
            return res.status(401).json({ data: null, message: "Unauthorized" });
        let exisingVendor = yield vendorModel_1.default.findById(Vendorid);
        if (!exisingVendor)
            return res.status(401).json({ data: null, message: "Vendor not found" });
        const { invoiceNumber, description, totalAmount } = req.body;
        const NewBill = new billModel_1.default({ vendorName: exisingVendor.vendorName, invoiceNumber, description, totalAmount, totalPaid: 0, balaceAmount: totalAmount, paidPercentage: 0, status: "Not paid" });
        exisingVendor.bills.push(NewBill);
        yield NewBill.save({ session });
        if (NewBill) {
            yield exisingVendor.save({ session });
            return res.status(201).json({ data: NewBill, message: "Sucessfully created new bill" });
        }
        else {
            return res.status(400).json({ data: null, message: "Failed to create new bill" });
        }
    }
    catch (error) {
        next(error);
        return res.status(500).json({ data: null, message: "Internal Server error" });
    }
    finally {
        yield session.commitTransaction();
    }
});
exports.NewBill = NewBill;
const updateBill = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const token = (_c = req.headers.authorization) === null || _c === void 0 ? void 0 : _c.split(' ')[1];
        const { id } = req.params;
        if (!token)
            return res.status(401).json({ data: null, message: "Unauthorized" });
        const Vendorid = accessTokenAuthenticator_1.accessTokenAuthenticator.TokenAuthenticator(token);
        if (!Vendorid)
            return res.status(401).json({ data: null, message: "Unauthorized" });
        const existingBill = yield billModel_1.default.findById(id);
        if (!existingBill)
            return res.status(400).json({ data: null, message: `Bill with this ${id} not found` });
        if (existingBill.status === "Paid")
            return res.status(400).json({ data: null, message: "Bill has already been paid; please create a new bill." });
        const { description, totalAmount } = req.body;
        const percentage = ((existingBill.totalPaid) / existingBill.totalAmount) * 100;
        let UpdateExisingBill = yield billModel_1.default.findByIdAndUpdate(id, { description, totalAmount, balaceAmount: totalAmount - existingBill.totalPaid, paidPercentage: percentage }, { new: true });
        if (UpdateExisingBill) {
            return res.status(201).json({ data: UpdateExisingBill, message: "Sucessfully updated bill" });
        }
        else {
            return res.status(400).json({ data: null, message: "Updation Failed" });
        }
    }
    catch (error) {
        next(error);
        return res.status(500).json({ data: null, message: "Internal Server error" });
    }
});
exports.updateBill = updateBill;
const deleteBill = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const token = (_d = req.headers.authorization) === null || _d === void 0 ? void 0 : _d.split(' ')[1];
        const { id } = req.params;
        if (!token)
            return res.status(401).json({ data: null, message: "Unauthorized" });
        const Vendorid = accessTokenAuthenticator_1.accessTokenAuthenticator.TokenAuthenticator(token);
        if (!Vendorid)
            return res.status(401).json({ data: null, message: "Unauthorized" });
        let deleteBill = yield billModel_1.default.findByIdAndDelete(id);
        if (deleteBill) {
            return res.status(201).json({ data: null, message: "Sucessfully deleted bill" });
        }
        else {
            return res.status(400).json({ data: null, message: "Updation Failed" });
        }
    }
    catch (error) {
        next(error);
        return res.status(500).json({ data: null, message: "Internal Server error" });
    }
});
exports.deleteBill = deleteBill;
const updatePayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const existingBill = yield billModel_1.default.findById(id);
        if (!existingBill) {
            return res.status(400).json({ data: null, message: `Bill with this ${id} not found` });
        }
        if (existingBill.totalPaid !== 0 && amount <= existingBill.balaceAmount) {
            const percentage = ((existingBill.balaceAmount + amount) / existingBill.totalAmount) * 100;
            const balanceAmount = existingBill.balaceAmount - amount;
            yield billModel_1.default.findByIdAndUpdate(id, { totalPaid: existingBill.totalPaid + amount, balaceAmount: balanceAmount, paidPercentage: percentage, status: balanceAmount === 0 ? "Paid" : "partially Paid" }, { new: true });
        }
        else if (existingBill.totalPaid === 0 && existingBill.totalAmount >= amount) {
            const percentage = (amount / existingBill.totalAmount) * 100;
            const balanceAmount = existingBill.totalAmount - amount;
            yield billModel_1.default.findByIdAndUpdate(id, { totalPaid: existingBill.totalPaid + amount, balaceAmount: balanceAmount, paidPercentage: percentage, status: balanceAmount === 0 ? "Paid" : "partially Paid" }, { new: true });
        }
        else {
            if (existingBill.totalPaid === existingBill.totalAmount)
                return res.status(400).json({ data: null, message: "Already your bill cleared" });
            if (amount > existingBill.totalAmount)
                return res.status(400).json({ data: null, message: "The payment amount exceeds the total bill amount. Please pay only the specified amount." });
            if (amount > (existingBill.balaceAmount - amount))
                return res.status(400).json({ data: null, message: "The payment amount exceeds the remaining balance. Please pay only the outstanding balance." });
            return res.status(400).json({ data: null, message: "Payment failed" });
        }
        return res.status(200).json({ data: null, message: "Successfully Paid" });
    }
    catch (error) {
        console.error(error);
        next(error);
        return res.status(500).json({ data: null, message: "Internal Server error" });
    }
});
exports.updatePayment = updatePayment;
