import { createSlice } from "@reduxjs/toolkit"

const userSlice = createSlice({
    name: "user",
    initialState:{
        isAuthenticated: false,
        loading: false,
        user: null,
        errors: null,
        success: false,
        // Flips to true once the initial "am I logged in?" request
        // (currentUser(), dispatched once from App.jsx) has settled,
        // one way or the other. Route guards must wait for this
        // before deciding to redirect - otherwise a hard refresh on
        // a protected page bounces you out before the session cookie
        // has even been checked.
        authChecked: false
    },
    reducers: {
        getSignupRequest(state){
            state.loading =true;
        },
        getSignupDetails(state, action){
            state.user = action.payload,
            state.isAuthenticated = true,
            state.loading = false
        },
        getLoginRequest(state){
            state.loading = true
        },
        getLoginDetails(state, action){
            state.user = action.payload,
            state.isAuthenticated = true,
            state.loading = false
        },
        getError(state, action){
            state.errors = action.payload;
            state.loading = false;
        },
        getCurrentRequest(state){
            state.loading = true;
        },
        getUpdateUserRequest(state){
            state.loading = true;
        },
        getCurrentUser(state, action){
            state.user = action.payload,
            state.isAuthenticated = true,
            state.loading = false,
            state.authChecked = true
        },
        getLogoutRequest(state){
            state.loading = true;
        },
        getLogout(state, action){
            state.user = action.payload,
            state.isAuthenticated = false,
            state.loading = false,
            state.authChecked = true
        },
        getPasswordRequest(state){
            state.loading = true
        },
        getPasswordSuccess(state, action){
            state.success = action.payload;
            state.loading = false
        },
        clearErrors(state){
            state.errors = null;
        }
    }
})

export const userActions = userSlice.actions;
export default userSlice;