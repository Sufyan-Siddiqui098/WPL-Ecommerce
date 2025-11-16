
export const validateFields = (req, res, next) => {
    const {firstName, lastName, email, password, phone} = req.body;

    const requiredFields = {firstName, lastName, phone};
    
    // Validation for SIGNUP (only)
    if(req.method === "POST"){
        // email is required only for (SIGNUP)
        requiredFields.email = email;

        // validate password 
        if(!password || password.trim().length < 8){
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters (without leading or trailing space)",
            });
        }
    }

    // An array to hold missing field names
    const missingFields = [];

    for (const key in requiredFields) {
        if (!requiredFields[key]) {
            missingFields.push(key);
        }
    }

    if (missingFields.length > 0) {
        const message = `The following ${missingFields.length > 1 ? "fields are" : "field is"} required: ${missingFields.join(', ')}.`;
        
        return res.status(400).json({
            success: false,
            message: message,
            missingFields: missingFields
        });
    }
    

    next();
};


export const validateLogin = (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).send({
            success: false,
            message: "Email & Password are required."
        })
    }

    next();

}
