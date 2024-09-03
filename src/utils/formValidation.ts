import { FieldError, PostInput } from "./graphqlTypes";
import { emailIsValid } from "./helpers";

export const registerValidation = (username: string, password: string, email: string): FieldError[] => {
    let errors: FieldError[] = [];
    if (username.length == 0){
        errors.push({
            field: "username",
            message: "Username is empty."
        })
    }else{
        if (username.includes("@"))
            errors.push({
                field: "username",
                message: "Cannot include \"@\" in your username."
            })
    }
    if (email.length == 0 || (email.length > 0 && !emailIsValid(email)))
        errors.push({
            field: "email",
            message: "You need to provide a valid email in order to create an account."
        })
    if (password.length < 6)
        errors.push({
            field: "password",
            message: "Password must be at least 6 characters long."
        })
 
    return errors;
}

export const createPostValidation = ({title, text}: PostInput) => {
    let errors: FieldError[] = [];
    if (!title || title.length == 0)
        errors.push({
            field: "title",
            message: "The title is required."
        })
    if (!text || text.length == 0)
        errors.push({
            field: "text",
            message: "The text is required."
        })
    return errors;
}