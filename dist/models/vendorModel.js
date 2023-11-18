"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const VendorSchema = new mongoose_1.Schema({
    vendorName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    bills: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Bills' }]
});
exports.default = (0, mongoose_1.model)('Vendors', VendorSchema);
