import mongoose, {Schema } from "mongoose";

const userSchema = new Schema({
    firstName:{
        type: String,
        required: true,
        trim: true
    }, 
    lastName: {
        type: String,
        required: true,
        trim: true
    }, 
    email: {
        type: String, 
        required: true,
        unique: true
    }, 
    password: {
        type: String, 
        required: true
    }, 
    phone: {
        type: String, 
        unique: true,
        required: true
    },
    role: {
        type: String, 
        enum: ["CUSTOMER", "ADMIN", "SELLER"],
        default: "CUSTOMER",
        require: true
    }, 
    
});

const User = mongoose.model("User", userSchema);

export default User;