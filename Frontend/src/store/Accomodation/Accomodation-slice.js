import { createSlice } from "@reduxjs/toolkit";

const accomodationSlice = createSlice({
  name: "accomodation",
  initialState: {
    accomodation: [],
    loading: false,
    errors: null,
  },
  reducers: {
    getAccomodationRequest(state) {
      state.loading = true;
    },
    getAccomodation(state, action) {
      state.accomodation = action.payload;
      state.loading = false;
    },
    getErrors(state, action) {
      state.errors = action.payload;
      state.loading = false;
    },
    // Swap in the freshly-updated accommodation after a Modify save,
    // so My Accommodations reflects it without a full refetch.
    updateAccomodationInList(state, action) {
      const updated = action.payload;
      state.accomodation = state.accomodation.map((item) =>
        item._id === updated._id ? updated : item
      );
      state.loading = false;
    },
    // Drop an accommodation from the list after it's been deleted.
    removeAccomodation(state, action) {
      state.accomodation = state.accomodation.filter(
        (item) => item._id !== action.payload
      );
      state.loading = false;
    },
  },
});

export const accomodationActions = accomodationSlice.actions;

export default accomodationSlice;
