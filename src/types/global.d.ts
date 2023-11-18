export {}
declare global{
    namespace NodeJS{
        interface ProcessEnv {
            JWT_USER: String
            JWT_RESTAURANT: String
        }
    }
}