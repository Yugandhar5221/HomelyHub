import { propertyAction } from "./property-slice";
import{ axiosInstance } from "../../utils/axios";

// get all properties
//1. start api req
//2. Tell redux loading started
//3. Get search parameters
//4. call backend api
//5. wait for response
//6. Get property data
//7. send data to Redux store
//8. If error => send error to Redux

//dispatch => SEND to Redux
//getStart => GET from Redux

export const getAllProperties = () => async(dispatch, getState) => {
    try{
     console.log("API call started");

     dispatch(propertyAction.getRequest())

     const {searchParams} = getState().properties

     console.log(searchParams)

     const response =  await axiosInstance.get(`/v1/rent/listing`,{
        params: {...searchParams}
     })

     if(!response){
        throw new Error("Could not fetch any properties")
     }

     const {data} = response;
     console.log(data);

     dispatch(propertyAction.getproperties(data))
        
    }catch(error){
    dispatch(propertyAction.getErrors(error.message))
    }
}