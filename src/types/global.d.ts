export {}
declare global{
    namespace NodeJS{
        interface ProcessEnv {
            JWT_USER: string
            JWT_RESTAURANT: string
        }
    }
}