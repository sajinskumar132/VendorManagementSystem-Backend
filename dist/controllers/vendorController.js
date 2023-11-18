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
exports.Login = exports.SignUp = void 0;
const vendorModel_1 = __importDefault(require("../models/vendorModel"));
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SignUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vendorName, email, password } = req.body;
        const existingVendor = yield vendorModel_1.default.findOne({ email });
        if (existingVendor)
            return res.status(400).json({ data: null, message: `User with ${email} already exists` });
        const errors = [];
        if (!vendorName.trim()) {
            errors.push('Name is required');
        }
        if (!email.trim()) {
            errors.push('Email is required');
        }
        if (!password.trim()) {
            errors.push('Password is required');
        }
        else if (password.length < 6) {
            errors.push('Password length should be minimum of 6');
        }
        if (errors.length > 0)
            return res.status(400).json({ data: null, message: errors.toString() });
        const encryptPassword = (0, bcryptjs_1.hashSync)(password);
        const newVendor = new vendorModel_1.default({ vendorName, email, password: encryptPassword });
        yield newVendor.save();
        if (newVendor) {
            const token = jsonwebtoken_1.default.sign({ id: newVendor._id }, process.env.SeacretKey, { expiresIn: '7D' });
            const data = {
                id: newVendor._id,
                vendorName: newVendor.vendorName,
                email: newVendor.email,
                token
            };
            return res.status(201).json({ data: data, message: "Sucessfully Created." });
        }
        else {
            return res.status(400).json({ data: null, message: "Failed to create user." });
        }
    }
    catch (error) {
        next(error);
        return res.status(500).json({ data: null, message: "Internal Server error" });
    }
});
exports.SignUp = SignUp;
const Login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const existingVendor = yield vendorModel_1.default.findOne({ email });
        if (!existingVendor)
            return res.status(400).json({ data: null, message: `User with ${email} not exists` });
        const errors = [];
        if (!email.trim()) {
            errors.push('Email is required');
        }
        if (!password.trim()) {
            errors.push('Password is required');
        }
        if (errors.length > 0)
            return res.status(400).json({ data: null, message: errors.toString() });
        const isValid = (0, bcryptjs_1.compareSync)(password, existingVendor.password);
        if (!isValid)
            return res.status(400).json({ data: null, message: `Incorrect password` });
        const token = jsonwebtoken_1.default.sign({ id: existingVendor._id }, process.env.SeacretKey, { expiresIn: '7D' });
        const data = {
            id: existingVendor._id,
            vendorName: existingVendor.vendorName,
            email: existingVendor.email,
            token
        };
        return res.status(200).json({ data: data, message: "Sucessfully login" });
    }
    catch (error) {
        next(error);
        return res.status(500).json({ data: null, message: "Internal Server error" });
    }
});
exports.Login = Login;
