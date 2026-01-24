import OpenAI from 'openai';
import config from '../config';

console.log("KEY =>", config.openRouterApiKey);

export const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: config.openRouterApiKey
});

