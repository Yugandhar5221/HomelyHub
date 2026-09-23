import { accomodationActions } from "./Accomodation-slice";
import { axiosInstance } from "../../utils/axios";

export const createAccomodation = (accomodationData) => async (dispatch) => {
  try {
    dispatch(accomodationActions.getAccomodationRequest());

    const response = await axiosInstance.post(
      "/v1/rent/user/newAccommodation",
      accomodationData
    );

    if (!response) {
      throw new Error("Could not create accommodation");
    }

    return response.data;
  } catch (error) {
    dispatch(
      accomodationActions.getErrors(
        error.response?.data?.message || error.message
      )
    );

    throw error;
  }
};

export const getAllAccomodation = () => async (dispatch) => {
  try {
    dispatch(accomodationActions.getAccomodationRequest());

    const { data } = await axiosInstance.get(
      "/v1/rent/user/myAccommodation"
    );

    const accom = data.data;

    dispatch(accomodationActions.getAccomodation(accom));

    return accom;
  } catch (error) {
    dispatch(
      accomodationActions.getErrors(
        error.response?.data?.message || error.message
      )
    );

    throw error;
  }
};

// PUT /v1/rent/listing/:id - used by the Modify Accommodation page
export const updateAccomodation = (id, accomodationData) => async (dispatch) => {
  try {
    const response = await axiosInstance.put(
      `/v1/rent/listing/${id}`,
      accomodationData
    );

    if (!response) {
      throw new Error("Could not update accommodation");
    }

    const updatedProperty = response.data.data.data;
    dispatch(accomodationActions.updateAccomodationInList(updatedProperty));

    return updatedProperty;
  } catch (error) {
    dispatch(
      accomodationActions.getErrors(
        error.response?.data?.message || error.message
      )
    );

    throw error;
  }
};

// DELETE /v1/rent/listing/:id
export const deleteAccomodation = (id) => async (dispatch) => {
  try {
    const response = await axiosInstance.delete(`/v1/rent/listing/${id}`);

    if (!response) {
      throw new Error("Could not delete accommodation");
    }

    dispatch(accomodationActions.removeAccomodation(id));

    return response.data;
  } catch (error) {
    dispatch(
      accomodationActions.getErrors(
        error.response?.data?.message || error.message
      )
    );

    throw error;
  }
};