import { checkAndGetEnvironmentVariable } from '../utils/env';

export class Misc {
    public static get LOGIN_DURATION(): string {
        return checkAndGetEnvironmentVariable(process.env.LOGIN_DURATION, 'LOGIN_DURATION must be defined');
    }

    public static get DFX_NETWORK(): string {
        return checkAndGetEnvironmentVariable(process.env.DFX_NETWORK, 'DFX_NETWORK must be defined');
    }
}
