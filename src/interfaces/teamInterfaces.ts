export interface TeamInterface {
    name: string;
    stadium: string;
    location: string;
    website: string;
    manager: string;
}

export interface TeamUpdateInterface {
    name?: string;
    stadium?: string;
    location?: string;
    website?: string;
    manager?: string;
}