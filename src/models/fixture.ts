import mongoose from "mongoose";

const fixtureSchema = new mongoose.Schema(
    {
        homeTeam: {
            type: String,
            required: true
        },
        awayTeam: {
            type: String,
            required: true
        },
        homeScore: {
            type: Number,
            default: 0
        },
        awayScore: {
            type: Number,
            default: 0
        },
        date: {
            type: Date,
            required: true
        },
        stadium: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["scheduled", "ongoing", "completed", "cancelled"],
            default: "scheduled"
        },
        url: {
            type: String,
            unique: true,
            required: true
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("fixture", fixtureSchema);
