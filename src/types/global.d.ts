export {}
declare global{
    namespace NodeJS{
        interface ProcessEnv {
            JWT_USER: string
            JWT_RESTAURANT: string
            AWS_ACCESS_KEY_ID: string,
            AWS_SECRET_ACCESS_KEY: string
            AVATAR_BUCKET_NAME: string
            LOGO_BUCKET_NAME: string
        }
    }
}