$(document).ready(function() {
  console.log("ready!");
  // setToken();
});

// Example starter JavaScript for disabling form submissions if there are invalid fields
(function() {
    'use strict';
  
    window.addEventListener('load', function() {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName('needs-validation');
  
      // Loop over them and prevent submission
      var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {
          const firstName = $("#firstName").val().trim();
          const lastName = $("#lastName").val().trim();
          const fullName = firstName + lastName;
          const address1 = $("#address1").val().trim();
          if (fullName.length > 30) {
            document.getElementById("firstName").setCustomValidity('Your combined first/last name cannot be greater than 30 characters.');
            document.getElementById("lastName").setCustomValidity('Your combined first/last name cannot be greater than 30 characters');
            $("#firstName-invalid-feedback").text("Your combined first/last name cannot be greater than 30 characters");
            $("#lastName-invalid-feedback").text("Your combined first/last name cannot be greater than 30 characters");
          }
          else {
            document.getElementById("firstName").setCustomValidity('');
            document.getElementById("lastName").setCustomValidity('');
            $("#firstName-invalid-feedback").text("This field is required.");
            $("#lastName-invalid-feedback").text("This field is required.");
          }
          if (address1.length > 30) {
              document.getElementById("address1").setCustomValidity('Address 1 cannot be greater than 30 characters.');
              $("#address1-invalid-feedback").text("Address 1 cannot be greater than 30 characters");
          } else {
              document.getElementById("address1").setCustomValidity('');
              $("#address1-invalid-feedback").text("This field is required");
          }
          if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
          }
          
          form.classList.add('was-validated');
        }, false);
      });
    }, false);
})();

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

$("#quantity").on("change", function() {
    const quantity = Number($(this).val());
    let total = quantity * 12;
    $("#total").html(total);
})