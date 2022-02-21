import {Request, Response, NextFunction} from "express";
import client from "../config/redis";
import axios from "axios";
import Team from "../models/team";
import _ from "lodash";
import { validateTeam, validateUpdateTeam } from "../middlewares/validation";

export const addTeam = async (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = validateTeam(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    try {
        const { name, stadium, location, website, manager } = value;
        const rediskey = 'teamlist';
        const redisID = 'teamId';
        const redisAllTeams = 'allTeams';
        const cachedTeamlist = await client.hGet(rediskey, name);
        
        if (cachedTeamlist) {
            return res.status(201).json({
                message: "Team already exists",
                data: JSON.parse(cachedTeamlist)
            })
        } else {
            const teamExists = await Team.findOne({ name });
            if (teamExists) {
                let id = teamExists._id.toString();
                await client.hSet(rediskey, teamExists.name, JSON.stringify(teamExists));
                await client.hSet(redisID, id, teamExists.name);
                return res.status(201).json({
                    message: "Team already exists",
                    data: teamExists
                })
            }
        }
        const newTeam = await Team.create({
            name,
            stadium,
            location,
            website,
            manager
        });
        const allTeams = await Team.find();
        let id = newTeam._id.toString();
        await client.hSet(rediskey, name, JSON.stringify(newTeam));
        await client.hSet(redisID, id, name);
        await client.set(redisAllTeams, JSON.stringify(allTeams));
        return res.status(201).json({
          status: "success",
          message: "Team added successfully",
          data: newTeam,
        });
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};

export const getAllTeams = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rediskey = 'allTeams';
        const cachedTeamlist = await client.get(rediskey);
        if (cachedTeamlist) {
            return res.status(200).json({
              status: "success",
              message: "Team list retrieved successfully",
              data: JSON.parse(cachedTeamlist),
            });
        } 
        const teams = await Team.find();
        if (!teams) return res.json({ message: "No teams found" });
        await client.set(rediskey, JSON.stringify(teams));
        return res.status(200).json({
            status: "success",
            message: "Team list retrieved successfully",
            data: teams
        });
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};

export const getTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(404).json({ message: "No team id provided" });
        const rediskey = 'teamlist';
        const redisID = 'teamId';
        const cachedTeamName = await client.hGet(redisID, id);
        if (cachedTeamName) {
            const cachedTeamlist: any = await client.hGet(rediskey, cachedTeamName);
            return res.status(200).json({
                status: "success",
                message: "Team retrieved successfully",
                data: JSON.parse(cachedTeamlist)
            });
        } 
        const team = await Team.findById(id);
        if (!team) return res.json({ message: "Team not found" });
        let teamId = team._id.toString();
        await client.hSet(redisID, teamId, team.name);
        await client.hSet(rediskey, team.name, JSON.stringify(team));
        return res.status(200).json({
          status: "success",
          message: "Team retrieved successfully",
          data: team,
        });
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};

export const updateTeam = async (req: Request, res: Response, next: NextFunction) => {
    let { error, value } = validateUpdateTeam(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    try {
        let { id } = req.params;
        if (!id) return res.json({ message: "Team id is required" });
        const { name, stadium, location, website, manager } = value;
        const rediskey = "teamlist";
        const redisID = "teamId";
        const redisAllTeams = "allTeams";
        const cachedTeamName: any = await client.hGet(redisID, id);
        if (cachedTeamName) {
            value._id = id;
            let cachedTeamlist: any = await client.hGet(rediskey, cachedTeamName);
            cachedTeamlist = JSON.parse(cachedTeamlist);
            delete cachedTeamlist.__v;
            delete cachedTeamlist.createdAt;
            delete cachedTeamlist.updatedAt;
            const sameData = _.isEqual(cachedTeamlist, value);
            if (sameData) {
                return res.status(201).json({
                    status: "success",
                    message: "Team updated successfully (Nothing changed)",
                    data: cachedTeamlist,
                });
            }
        } else {
            return res.json({ message: "Team not found" });
        }
        const team = await Team.findByIdAndUpdate(
            id,
            {
                name,
                stadium,
                location,
                website,
                manager,
            },
            { new: true }
        );
        if (!team) return res.json({ message: "Team not found" });
        if (cachedTeamName !== team.name) {
            await client.hDel(rediskey, cachedTeamName);
            await client.hSet(rediskey, team.name, JSON.stringify(team));
            await client.hSet(redisID, id, team.name);
            await client.del(redisAllTeams);
        } else {
            await client.hSet(rediskey, team.name, JSON.stringify(team));
            await client.del(redisAllTeams);
        }
        return res.status(201).json({
          status: "success",
          message: "Team updated successfully",
          data: team,
        });
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};

export const deleteTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { id } = req.params;
        if (!id) return res.json({ message: "Team id is required" });
        const rediskey = "teamlist";
        const redisID = "teamId";
        const redisAllTeams = "allTeams";
        const cachedTeamName: any = await client.hGet(redisID, id);
        if (cachedTeamName) {
            await client.hDel(rediskey, cachedTeamName);
            await client.hDel(redisID, id);
            await client.del(redisAllTeams);
        } else {
            return res.json({ message: "Team not found" });
        }
        const team = await Team.findByIdAndDelete(id);
        if (!team) return res.json({ message: "Team not found" });
        return res.status(200).json({
            status: "success",
            message: "Team deleted successfully",
            data: team,
        });
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};

export const searchTeams = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { teamName }: any = req.query;
         const rediskey = "teamlist";
        const redisID = "teamId";
        const redisAllTeams = "allTeams";
        //  const cachedTeamName = await client.hGet(redisID, id);
        const cachedAllTeams = await client.get(redisAllTeams);
        if (cachedAllTeams) {
           const cachedTeamlist: any = await client.hGet(rediskey, teamName.toLowerCase());
           return res.status(200).json({
             status: "success",
             message: "Team retrieved successfully",
             data: JSON.parse(cachedTeamlist),
           });
         }
        const team = await Team.findOne({ name: teamName.toLowerCase() });
        if (!team) return res.json({ message: "Team not found" });
        const allTeams = await Team.find();
        let teamId = team._id.toString();
         await client.hSet(redisID, teamId, team.name);
        await client.hSet(rediskey, team.name, JSON.stringify(team));
        await client.set(redisAllTeams, JSON.stringify(allTeams));
         return res.status(200).json({
           status: "success",
           message: "Team retrieved successfully",
           data: team,
         });
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};