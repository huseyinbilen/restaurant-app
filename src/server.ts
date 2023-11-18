import app from "."
import mongoose from "mongoose"


mongoose.connect('mongodb://127.0.0.1:27017/restaurant-app')
    .then(result=>{        
        if(result){
            void app.listen({host:"0.0.0.0",port:8000})
            console.log(`App Started Succesfully!`);
            return {connectionStatus:true}
        }
    })
    .then((status)=>{
        console.log(`DB connection status is ${status?.connectionStatus}`);
    })
    .catch(exception=>{
        console.error(exception)
    })