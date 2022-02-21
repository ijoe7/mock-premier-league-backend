import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        stadium: {
            type: String,
            required: true,
            unique: true
        },
        website: {
            type: String,
            default: "-",
            trim: true
        },
        location: {
            type: String,
            required: true
        },
        manager: {
            type: String,
            default: "-"
        },
        // players: {
        //     type: [String]
        // }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("team", teamSchema);
