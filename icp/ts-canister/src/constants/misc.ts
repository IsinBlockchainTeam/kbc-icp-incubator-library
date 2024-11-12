import { checkAndGetEnvironmentVariable } from '../utils/env';

export const LOGIN_DURATION = () => checkAndGetEnvironmentVariable(process.env.LOGIN_DURATION, 'LOGIN_DURATION must be defined');
export const DFX_NETWORK = () => checkAndGetEnvironmentVariable(process.env.DFX_NETWORK, 'DFX_NETWORK must be defined');
