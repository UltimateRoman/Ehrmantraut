import {APODResponse} from './types'

const BASE_URL = "https://api.nasa.gov/planetary/apod\?api_key\="

export const createTransaction = (apiKey : string) => {
    const getAPOD = async (): Promise<APODResponse> => {
        if(!apiKey)
            throw new Error("Invalid API key");
        try {
            const url = BASE_URL + apiKey;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json() as APODResponse;
            return data;
        } catch (error) {
            throw new Error(`Failed to fetch APOD: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    return {getAPOD};
}