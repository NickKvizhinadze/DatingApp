import { Photo } from './Photo';

export interface User {
    id: number;
    username: string;
    kwownAs: string;
    age: number;
    gender: string;
    created: string;
    lastActive: Date;
    photoUrl: string;
    city: string;
    country: string;
    interests?: string;
    introduction?: string;
    lookingFor?: string;
    photos?: Photo[];
}
