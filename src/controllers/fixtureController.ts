import { Request, Response, NextFunction } from "express";
import client from "../config/redis";
import Fixture from "../models/fixture";
import Team from "../models/team";
import _ from "lodash";
import { generateUniqueCode } from "../config/helper";
import { validateFixture, validateUpdateFixture } from "../middlewares/validation";
import dotenv from "dotenv";
dotenv.config();


export const addFixture = async (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = validateFixture(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    try {
        const { homeTeam, awayTeam, date } = value;
        const redisTeamkey = "teamlist";
        const rediskey = "fixturelist";
        const redisID = "fixtureId";
        const redisFixtureUrl = "fixtureUrl";

        const redisDataExists = await client.exists(redisTeamkey)
        if (redisDataExists === 1) {
            const fixtureExists = await client.hGet(rediskey, `${homeTeam}-${awayTeam}`);
            if (fixtureExists && JSON.parse(fixtureExists).status === "scheduled" || fixtureExists && JSON.parse(fixtureExists).status === "ongoing") {
                return res.json({
                    message: "Fixture already exists with its unique URL",
                    fixture: JSON.parse(fixtureExists),
                    link: `${process.env.MY_DOMAIN}${process.env.FRONTEND_ROUTE}${JSON.parse(fixtureExists).url}`
                });
            }
            // Confirm if team data exists in redis
            const cachedHomeTeam = await client.hGet(redisTeamkey, homeTeam);
            const cachedAwayTeam = await client.hGet(redisTeamkey, awayTeam);
            if (!cachedHomeTeam) return res.json({ message: "Home team does not exist" });
            if (!cachedAwayTeam) return res.json({ message: "Away team does not exist" });
            
            // Check if date is in the past
            const today = new Date();
            let completionDate = new Date(date.getTime())
            completionDate.setHours(completionDate.getHours() + 1.5);
            if (completionDate < today) return res.json({ message: "Fixture date cannot be in the past" });
            let status = "scheduled";
            if (today > date && today < completionDate) {
                status = "ongoing";
            }

            // Delete the fixture form database if it exists
            await Fixture.findOneAndDelete({ homeTeam, awayTeam, status });
            
            // Create Fixture and populate location
            const stadium = JSON.parse(cachedHomeTeam).stadium;
            const location = JSON.parse(cachedHomeTeam).location;
            let url = generateUniqueCode();
            // check if url exists in db
            let urlExists = await client.hGet(redisFixtureUrl, url);
            if (urlExists) {
                while (urlExists) {
                    url = generateUniqueCode();
                    urlExists = await client.hGet(redisFixtureUrl, url);
                }
            }
            // url = `${process.env.MY_DOMAIN}${process.env.FRONTEND_ROUTE}${url}`;

            const fixture = await Fixture.create({ homeTeam, awayTeam, date, stadium, location, status, url });
            if (!fixture) return res.json({ message: "Fixture not created" });
            const populateFixture = await Fixture.findById(fixture._id);
            const id = fixture._id.toString();
            // Save fixture to redis
            await client.hSet(rediskey, `${homeTeam}-${awayTeam}`, JSON.stringify(populateFixture));
            await client.hSet(redisID, id, `${homeTeam}-${awayTeam}`);
            await client.hSet(redisFixtureUrl, url, `${homeTeam}-${awayTeam}`);
            return res.json({
                status: "success",
                message: "Fixture created successfully and URL generated",
                data: populateFixture,
                link: `${process.env.MY_DOMAIN}${process.env.FRONTEND_ROUTE}${url}`
            });
        } else {
            return res.json({ message: "Team list does not exist. Fetch or Add specified Teams." });
        }
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};

export const getAllFixtures = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rediskey = "allFixtures";
        const cachedFixtureList = await client.get(rediskey);
        if (cachedFixtureList) {
            return res.json({
                status: "success",
                message: "All Fixtures retrieved successfully",
                data: JSON.parse(cachedFixtureList)
            });
        }
        const fixtures = await Fixture.find({});
        if (!fixtures) return res.json({ message: "Fixture not found" });
        await client.set(rediskey, JSON.stringify(fixtures));
        return res.json({
            status: "success",
            message: "All Fixtures retrieved successfully",
            data: fixtures
        });
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};

export const getFixture = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { url } = req.params;
        if (!url) return res.json({ message: "Fixture URL is required" });
        const rediskey = "fixturelist";
        const redisFixtureUrl = "fixtureUrl";
        const redisID = "fixtureId";
        const redisAllFixtures = "allFixtures";
        const cachedFixturename = await client.hGet(redisFixtureUrl, url);
        if (cachedFixturename) {
            const cachedFixture: any = await client.hGet(rediskey, cachedFixturename);
            return res.json({
                status: "success",
                message: "Fixture retrieved successfully",
                data: JSON.parse(cachedFixture)
            });
        }
        const fixture = await Fixture.findOne({ url });
        if (!fixture) return res.json({ message: "Fixture not found" });
        const allFixtures = await Fixture.find({});
        const fixtureId = fixture._id.toString();
        const fixtureUrl = fixture.url;
        await client.hSet(redisID, fixtureId, `${fixture.homeTeam}-${fixture.awayTeam}`);
        await client.hSet(redisFixtureUrl, fixtureUrl, `${fixture.homeTeam}-${fixture.awayTeam}`);
        await client.hSet(rediskey, `${fixture.homeTeam}-${fixture.awayTeam}`, JSON.stringify(fixture));
        await client.set(redisAllFixtures, JSON.stringify(allFixtures));
        return res.json({
            status: "success",
            message: "Fixture retrieved successfully",
            data: fixture
        });
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};

export const updateFixture = async (req: Request, res: Response, next: NextFunction) => {
    let { error, value } = validateUpdateFixture(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    try {
        let { url } = req.params;
        if (!url) return res.json({ message: "Fixture URL is required" });
        const { homeScore, awayScore, date, status } = value;
        const rediskey = "fixturelist";
        const redisFixtureUrl = "fixtureUrl";
        const redisAllFixtures = "allFixtures";
        const cachedFixturename = await client.hGet(redisFixtureUrl, url);
        if (!cachedFixturename) return res.json({ message: "Fixture not found" });
        const cachedFixture: any = await client.hGet(rediskey, cachedFixturename);
        const fixtureStatus = JSON.parse(cachedFixture).status;
        const fixture = await Fixture.findOneAndUpdate({ url }, { homeScore, awayScore, date, status }, { new: true });
        if (!fixture) return res.json({ message: "Fixture not found" });
        await client.hSet(rediskey, cachedFixturename, JSON.stringify(fixture));
        await client.del(redisAllFixtures);
        return res.json({
            status: "success",
            message: "Fixture updated successfully",
            data: fixture
        });
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};

export const deleteFixture = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { url } = req.params;
        if (!url) return res.json({ message: "Fixture URL is required" });
        const rediskey = "fixturelist";
        const redisFixtureUrl = "fixtureUrl";
        const redisID = "fixtureId";
        const redisAllFixtures = "allFixtures";
        const cachedFixturename = await client.hGet(redisFixtureUrl, url);
        if (!cachedFixturename) return res.json({ message: "Fixture not found" });
        const fixture = await Fixture.findOneAndDelete({ url });
        if (!fixture) return res.json({ message: "Fixture not found" });
        await client.hDel(rediskey, cachedFixturename);
        await client.hDel(redisFixtureUrl, url);
        await client.hDel(redisID, cachedFixturename);
        await client.del(redisAllFixtures);
        return res.json({
            status: "success",
            message: "Fixture deleted successfully",
            data: fixture
        });
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};

export const getCompleteFixtures = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rediskey = "completeFixtures";
        const cachedFixtureList = await client.get(rediskey);
        if (cachedFixtureList) {
            return res.json({
                status: "success",
                message: "All Fixtures retrieved successfully",
                data: JSON.parse(cachedFixtureList)
            });
        }
        const fixtures = await Fixture.find({ status: "completed" });
        if (!fixtures) return res.json({ message: "Fixture not found" });
        await client.setEx(rediskey, 15, JSON.stringify(fixtures));
        return res.json({
            status: "success",
            message: "All Fixtures retrieved successfully",
            data: fixtures
        });
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};

export const getPendingFixtures = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rediskey = "scheduledFixtures";
        const rediskey2 = "ongoingFixtures";
        const cachedFixtureList: any = await client.get(rediskey);
        const cachedFixtureList2: any = await client.get(rediskey2);
        if (cachedFixtureList) {
            return res.json({
                status: "success",
                message: "All Fixtures retrieved successfully",
                scheduled: JSON.parse(cachedFixtureList),
                ongoing: JSON.parse(cachedFixtureList2)
            });
        }
        const fixtures = await Fixture.find({ status: "scheduled" });
        const ongoingFixtures = await Fixture.find({ status: "ongoing" });
        await client.setEx(rediskey, 15, JSON.stringify(fixtures));
        await client.setEx(rediskey2, 15, JSON.stringify(ongoingFixtures));
        return res.json({
            status: "success",
            message: "All Fixtures retrieved successfully",
            scheduled: fixtures,
            ongoing: ongoingFixtures
        });
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};

export const searchFixtures = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const redisAllFixtures = "allFixtures";
        const { homeOrAway }: any = req.query;
        const cachedFixtureList = await client.get(redisAllFixtures);
        if (cachedFixtureList) {
            const allFixtures = JSON.parse(cachedFixtureList);
            const filteredFixtures = allFixtures.filter((fixture: any) => {
                return fixture.homeTeam.toLowerCase().includes(homeOrAway.toLowerCase()) ||
                    fixture.awayTeam.toLowerCase().includes(homeOrAway.toLowerCase());
            });
            return res.json({
                status: "success",
                message: "Fixtures retrieved successfully",
                data: filteredFixtures
            });
        }
        const fixtures = await Fixture.find({});
        if (!fixtures) return res.json({ message: "Fixture not found" });
        await client.setEx(redisAllFixtures, 15, JSON.stringify(fixtures));
        const filteredFixtures = fixtures.filter((fixture: any) => {
            return fixture.homeTeam.toLowerCase().includes(homeOrAway.toLowerCase()) ||
                fixture.awayTeam.toLowerCase().includes(homeOrAway.toLowerCase());
        });
        return res.json({
            status: "success",
            message: "Fixtures retrieved successfully",
            data: filteredFixtures
        });
    } catch (error) {
        console.log(error);
        return res.json({ error });
    }
};
