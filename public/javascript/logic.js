$(document).ready(function() {
    console.log("ready!");
    // setToken();
});


function setToken() {
    const now = new Date();
    const unixTimestamp = now.getTime();
    const accessToken = sessionStorage.getItem("accessToken");
    const accessTokenExpireTimestamp = Number(sessionStorage.getItem("accessTokenExpireTimestamp"));
    const refreshTokenExpireTimestamp = Number(sessionStorage.getItem("refreshTokenExpireTimestamp"));
    if (!accessToken || (unixTimestamp > refreshTokenExpireTimestamp)) {
        return newAccessToken();
    } else if (accessToken && (unixTimestamp < accessTokenExpireTimestamp)) {
        return accessToken;
    } else if (accessToken && (unixTimestamp > accessTokenExpireTimestamp) && (unixTimestamp < refreshTokenExpireTimestamp)) {
        return useRefreshToken();
    }
}

function newAccessToken() {
    console.log("newAccessToken()")
    const now = new Date();
    const unixTimestamp = now.getTime();
    $.ajax("/api/access-token", {
        method: "POST",
        error: function(error) {
            console.log(error)
        }
    }).then(function(data){
        const accessToken = data.access_token;
        const accessTokenExpireTimestamp = unixTimestamp + (data.expires_in * 1000);
        const refreshToken = data.refresh_token;
        const refreshTokenExpireTimestamp = unixTimestamp + (data.refresh_expires_in * 1000);
        const token = {
            accessToken,
            accessTokenExpireTimestamp,
            refreshToken,
            refreshTokenExpireTimestamp
        }
        for (const property in token) {
            sessionStorage.setItem(property, token[property])
        }
        return sessionStorage.getItem("refreshToken");
    })
}

function useRefreshToken() {
    console.log("useRefreshToken()")
    const now = new Date();
    const unixTimestamp = now.getTime();
    let refreshToken = sessionStorage.getItem("refreshToken");
    $.ajax("/api/refresh-token", {
        method: "POST",
        data: "refresh_token=" + refreshToken,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        error: function(error) {
            console.log(error)
        }
    }).then(function(data) {
        const accessToken = data.access_token;
        const accessTokenExpireTimestamp = unixTimestamp + (data.expires_in * 1000);
        refreshToken = data.refresh_token;
        const refreshTokenExpireTimestamp = unixTimestamp + (data.refresh_expires_in * 1000);
        const token = {
            accessToken,
            accessTokenExpireTimestamp,
            refreshToken,
            refreshTokenExpireTimestamp
        }
        for (const property in token) {
            sessionStorage.setItem(property, token[property])
        }
        return sessionStorage.getItem("refreshToken");
    })
}

$("#getPrintJobs").on("click", function() {
    console.log("#getPrintJobs works!");
    const accessToken = setToken();
    $.ajax("https://api.sandbox.lulu.com/print-jobs/", {
        method: "GET",
        headers: {
            Authorization: "Bearer " + accessToken
        }, 
        error: function(error) {
            console.log(error)
        }
    }).then(function(data) {
        console.log(data);
    })
});