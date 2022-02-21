import Joi from "joi";

export const validateSignUp = (user: Record<string, any>) => {
    const schema = Joi.object({
        username: Joi.string().lowercase().required(),
        email: Joi.string().email().lowercase().required(),
        password: Joi.string().required(),
        role: Joi.string().lowercase().valid("user", "admin").default("user"),
    });
    
    return schema.validate(user);
};

export const validateSignIn = (user: Record<string, any>) => {
    const schema = Joi.object({
        username: Joi.string().lowercase(),
        email: Joi.string().email().lowercase(),
        password: Joi.string().required()
    });
    
    return schema.validate(user);
};

export const validateTeam = (team: Record<string, any>) => {
    const schema = Joi.object({
        name: Joi.string().lowercase().required(),
        stadium: Joi.string().lowercase().required(),
        location: Joi.string().lowercase().required(),
        website: Joi.string(),
        manager: Joi.string().lowercase()
    });
    
    return schema.validate(team);
};
export const validateUpdateTeam = (team: Record<string, any>) => {
    const schema = Joi.object({
        name: Joi.string().lowercase(),
        stadium: Joi.string().lowercase(),
        location: Joi.string().lowercase(),
        website: Joi.string(),
        manager: Joi.string().lowercase()
    });
    
    return schema.validate(team);
};

export const validateFixture = (fixture: Record<string, any>) => {
    const schema = Joi.object({
        homeTeam: Joi.string().lowercase().required(),
        awayTeam: Joi.string().lowercase().required(),
        date: Joi.date().required()
    });
    
    return schema.validate(fixture);
};

export const validateUpdateFixture = (fixture: Record<string, any>) => {
    const schema = Joi.object({
        homeScore: Joi.number(),
        awayScore: Joi.number(),
        date: Joi.date(),
        status: Joi.string().valid("scheduled", "ongoing", "completed", "cancelled")
    });
    
    return schema.validate(fixture);
};