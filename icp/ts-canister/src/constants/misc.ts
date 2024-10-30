import { checkAndGetEnvironmentVariable } from '../utils/env';

export const LOGIN_DURATION = () => checkAndGetEnvironmentVariable(process.env.LOGIN_DURATION, 'LOGIN_DURATION must be defined');
