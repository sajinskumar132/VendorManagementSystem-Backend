"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BillSchema = new mongoose_1.Schema({
    vendorName: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    description: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    totalPaid: { type: Number, required: true },
    balaceAmount: { type: Number, required: true },
    paidPercentage: { type: Number, required: true },
    status: { type: String, required: true }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Bills', BillSchema);
