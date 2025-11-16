import bcrypt from 'bcrypt';

export const createHashPassword = async (password) => {
    try {
        const saltRouned = 10;
        const hashedPassword = await bcrypt.hash(password, saltRouned);
        return hashedPassword;
        
    } catch (error) {
        throw new Error(
            (error.message ?
             error.message : 
             "Error while hashing password"
            ), 
             error);
    }
}

export const comparePassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw new Error(
            (error.message ?
             error.message : 
             "Error while comparing password"
            ), 
             error);
    }
}