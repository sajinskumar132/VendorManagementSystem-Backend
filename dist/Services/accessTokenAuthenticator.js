"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessTokenAuthenticator = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class accessTokenAuthenticator {
}
exports.accessTokenAuthenticator = accessTokenAuthenticator;
accessTokenAuthenticator.TokenAuthenticator = (token) => {
    let id;
    jsonwebtoken_1.default.verify(token, process.env.SeacretKey, (err, decoded) => {
        if (!err) {
            id = decoded.id;
        }
    });
    return id;
};
