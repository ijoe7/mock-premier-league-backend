export interface FixtureInterface {
    homeTeam: string;
    awayTeam: string;
    date: string;
}

export interface FixtureUpdateInterface {
    homeScore?: number;
    awayScore?: number;
    status?: string;
    date?: string;
}