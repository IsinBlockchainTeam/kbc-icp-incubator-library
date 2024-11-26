export function getRequiredEnvs<T extends string>(...keys: T[]): Record<T, string> {
    const envs = {} as Record<T, string>;

    for (const key of keys) {
        const value = process.env[key];
        if (value === undefined || value === '') {
            throw new Error(`Required environment variable ${key} is not defined`);
        }
        envs[key] = value;
    }

    return envs;
}
