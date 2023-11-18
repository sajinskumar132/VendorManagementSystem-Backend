"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const dbConnection_1 = require("./connection/dbConnection");
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./Routes/routes"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/', routes_1.default);
const StartServer = () => {
    try {
        (0, dbConnection_1.DbConnect)().then(() => {
            app.listen(process.env.PORT, () => {
                console.log('server Started');
            });
        });
    }
    catch (error) {
        console.log(error);
    }
};
StartServer();
