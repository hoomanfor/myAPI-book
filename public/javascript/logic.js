$("#getPrintJobs").on("click", function() {
    console.log("#getPrintJobs works!");
    const accessToken = sessionStorage.getItem("accessToken");
    console.log(accessToken);
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

$("#getToken").on("click", function() {
    console.log("#getToken works!");
    const now = new Date();
    const unixTimestamp = now.getTime();
    $.ajax("/get-token", {
        method: "POST"
    }).then(function(data){
        console.log(data)
        const accessToken = data.access_token;
        const accessTokenExpireTimestamp = unixTimestamp + data.expires_in;
        const refreshToken = data.refresh_token;
        const refreshTokenExpireTimestamp = unixTimestamp + data.refresh_expires_in;
        const token = {
            accessToken,
            accessTokenExpireTimestamp,
            refreshToken,
            refreshTokenExpireTimestamp
        }
        for (const property in token) {
            sessionStorage.setItem(property, token[property])
        }
    })
})

$("#useRefreshToken").on("click", function() {
    console.log("#useRefreshToken works!");
    const refreshToken = sessionStorage.getItem("refreshToken");
    $.ajax("/refresh-token", {
        method: "POST",
        data: "grant_type=refresh_token&refresh_token=" + refreshToken,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        error: function(error) {
            console.log(error)
        }
    }).then(function(data) {
        console.log(data)
    })
})

