declare namespace NodeJS {
    export interface ProcessEnv {
        DB_NAME: string,
        DB_USER: string,
        DB_PORT: number,
        DB_PASSWORD: string,
        NODE_ENV: string,
        APP_PORT: number,
        REDIS_SECRET: string
    }
}