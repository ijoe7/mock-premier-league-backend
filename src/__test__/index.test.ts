import { dbConnect, dbDisconnect } from "../db/mongoMemoryServer";
import { UserInterface, SignInInterface } from "../interfaces/userInterfaces";
import { TeamInterface, TeamUpdateInterface } from "../interfaces/teamInterfaces";
import { FixtureInterface, FixtureUpdateInterface } from "../interfaces/fixtureInterface";
import request from "supertest";
import app from "../app";
import client from "../config/redis";


let prefilled: {} = {};

beforeAll(async () => {
  await dbConnect();
});

afterAll(async () => {
  client.quit();
  dbDisconnect()
});

// let userId: string = '';
// let userToken: any;
let id: string = '';
let currentUser: Record<string, any> = {};
let teamData: Record<string, any> = {};
let teamData2: Record<string, any> = {};
let fixtureData: Record<string, any> = {};

const user: UserInterface = {
  username: "alex",
  email: "alexa@example.com",
  password: "1234",
  role: "admin"
};

const userSignIn: SignInInterface = {
  username: "alex",
  email: "alexa@example.com",
  password: "1234",
};

const team: TeamInterface = {
  name: "Arsenal",
  stadium: "Emirates",
  location: "London",
  website: "www.arsenal.com",
  manager: "Arsene Wenger"
}
const team2: TeamInterface = {
  name: "Chelsea",
  stadium: "Stamford Bridge",
  location: "London",
  website: "www.chelsea.com",
  manager: "Frank Lampard"
};

const teamUpdate: TeamUpdateInterface = {
  manager: "Mikel Arteta"
};

const fixture: FixtureInterface = {
  homeTeam: "Arsenal",
  awayTeam: "Chelsea",
  date: "2022-3-12 9:00:00"
};

const fixtureUpdate: FixtureUpdateInterface = {
  homeScore: 2,
  awayScore: 1,
  status: "completed"
};

describe("User Authentication Test Suite", () => {
  test("should create a new user successfully", async () => {
    const res = await request(app).post("/api/users/signUp").send(user);
    expect(res.status).toBe(201);
  });
  test("should log in a user", async () => {
    const res = await request(app).post("/api/users/signIn").send(userSignIn);
    expect(res.status).toBe(200);
  });
  test("should log in and generate token", async () => {
    const loggedUser = {
      username: userSignIn.username,
      password: userSignIn.password,
    };
    const res = await request(app).post("/api/users/signIn").send(loggedUser);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    currentUser.token = res.body.token;
    currentUser.id = res.body._id;
  });
});

describe("Team CRUD implementation Test Suite", () => {
  test("should create a new team successfully", async () => {
    const res = await request(app)
      .post("/api/teams/addTeam")
      .set("Authorization", `Bearer ${currentUser.token}`)
      .send(team);
    expect(res.status).toBe(201);
    teamData.id = res.body.data._id;
    teamData.name = res.body.data.name;
  });
  test("should create a second team successfully", async () => {
    const res = await request(app)
      .post("/api/teams/addTeam")
      .set("Authorization", `Bearer ${currentUser.token}`)
      .send(team2);
    expect(res.status).toBe(201);
    teamData2.id = res.body.data._id;
    teamData2.name = res.body.data.name;
  });
  test("should get all teams", async () => {
    const res = await request(app)
      .get("/api/teams/getAllTeams")
      .set("Authorization", `Bearer ${currentUser.token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("data");
  });
  test("should get a team by id", async () => {
    const res = await request(app)
      .get(`/api/teams/getTeam/${teamData.id}`)
      .set("Authorization", `Bearer ${currentUser.token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("data");
  });
  test("should update a team", async () => {
    const res = await request(app)
      .put(`/api/teams/updateTeam/${teamData.id}`)
      .set("Authorization", `Bearer ${currentUser.token}`)
      .send(teamUpdate);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("data");
  });
  test("should search teams by team name", async () => {
    const res = await request(app)
      .get(`/api/teams/searchTeams/?teamName=${teamData.name}`)
      .set("Authorization", `Bearer ${currentUser.token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("data");
  });
});

describe("Fixture CRUD implementation Test Suite", () => {
  test("should create a new fixture successfully", async () => {
    const res = await request(app)
    .post("/api/fixtures/addFixture")
    .set("Authorization", `Bearer ${currentUser.token}`)
    .send(fixture);
    expect(res.status).toBe(201);
    fixtureData.id = res.body.data._id;
    fixtureData.url = res.body.data.url;
  });
  test("should get all fixtures", async () => {
    const res = await request(app)
    .get("/api/fixtures/getAllFixtures")
    .set("Authorization", `Bearer ${currentUser.token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("data");
  });
  test("should get a fixture by id", async () => {
    const res = await request(app)
    .get(`/api/fixtures/getFixture/${fixtureData.url}`)
    .set("Authorization", `Bearer ${currentUser.token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("data");
  });
  test("should update a fixture", async () => {
    const res = await request(app)
    .put(`/api/fixtures/updateFixture/${fixtureData.url}`)
    .set("Authorization", `Bearer ${currentUser.token}`)
    .send(fixtureUpdate);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("data");
  });
  test("should get all completed Fixtures", async () => {
    const res = await request(app)
    .get("/api/fixtures/getCompleteFixtures")
    .set("Authorization", `Bearer ${currentUser.token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("data");
  });
  test("should get all pending Fixtures", async () => {
    const res = await request(app)
    .get("/api/fixtures/getPendingFixtures")
    .set("Authorization", `Bearer ${currentUser.token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body).toHaveProperty("scheduled");
    expect(res.body).toHaveProperty("ongoing");
  })
  test("should search fixtures by team name", async () => {
    const res = await request(app)
    .get(`/api/fixtures/searchFixtures/?homeOrAway=${teamData.name}`)
    .set("Authorization", `Bearer ${currentUser.token}`);
    expect(res.status).toBe(200);
  });
  test("should delete a fixture", async () => {
    const res = await request(app)
    .delete(`/api/fixtures/deleteFixture/${fixtureData.url}`)
    .set("Authorization", `Bearer ${currentUser.token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });
  test("should delete a team", async () => {
    const res = await request(app)
      .delete(`/api/teams/deleteTeam/${teamData.id}`)
      .set("Authorization", `Bearer ${currentUser.token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });
});
