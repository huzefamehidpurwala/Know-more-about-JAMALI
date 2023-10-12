(function () {
  "use strict";

  let forms = document.querySelectorAll(".php-email-form");

  forms.forEach(function (e) {
    e.addEventListener("submit", function (event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute("action");
      let recaptcha = thisForm.getAttribute("data-recaptcha-site-key");

      if (!action) {
        displayError(thisForm, "The form action property is not set!");
        return;
      }
      thisForm.querySelector(".loading").classList.add("d-block");
      thisForm.querySelector(".error-message").classList.remove("d-block");
      thisForm.querySelector(".sent-message").classList.remove("d-block");

      let formData = new FormData(thisForm);

      if (recaptcha) {
        if (typeof grecaptcha !== "undefined") {
          grecaptcha.ready(function () {
            try {
              grecaptcha
                .execute(recaptcha, { action: "php_email_form_submit" })
                .then((token) => {
                  formData.set("recaptcha-response", token);
                  // console.log("form submitted in try");
                  php_email_form_submit(thisForm, action, formData);
                });
            } catch (error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(
            thisForm,
            "The reCaptcha javascript API url is not loaded!"
          );
        }
      } else {
        // console.log("form submitted in else");
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    const userEmail = thisForm.querySelector("#email").value;
    // console.log(userEmail, "keseho");
    // console.log(thisForm, "thisForm");

    let url = `${action}?`;
    formData.forEach((value, key) => {
      // console.log(`Input name: ${key}, Input value: ${value}`);
      let str = `${key}=${encodeURIComponent(value)}&`;
      url += str;
    });
    // console.log(url);

    const emailCheckerAPI = `https://api.zerobounce.net/v2/validate?api_key=f5fc47d5e9e54dd59d3cce6ceed8d010&email=${userEmail}&ip_address=`;

    // console.log('We are getting into somewhere');
    fetch(emailCheckerAPI)
      .then((response) => {
        // console.log("email checker", response);
        if (response.ok) {
          return response.text();
        } else {
          throw new Error(
            `${response.status} ${response.statusText} ${response.url}`
          );
        }
      })
      .then((data) => {
        const dataJSON = JSON.parse(data);
        // console.log("email data", dataJSON);
        thisForm.querySelector(".loading").classList.remove("d-block");
        if (dataJSON.status === "valid") {
          fetch(url);
          thisForm.querySelector(
            ".sent-message"
          ).innerHTML = `Thank you so much! I'll keep an eye on my inbox for your response. 😊💫<br>I'll revert back on ${userEmail}`;
          // thisForm.querySelector(".sent-message").insertAdjacentHTML("beforeend", " " + userEmail);
          thisForm.querySelector(".loading").classList.remove("d-block");
          thisForm.querySelector(".sent-message").classList.add("d-block");
          thisForm.reset();
        } else {
          throw new Error(
            `Form submission failed as ${userEmail} is not valid email address.<br>MailAddressError: ${dataJSON.sub_status}`
          );
        }
      })
      .catch((error) => {
        console.log("error occured: ", error);
        displayError(thisForm, error);
      });

    // fetch(url);
    /* .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // You can handle the response here if needed
        return response.text();
      })
      .then((data) => {
        // Handle the data or perform any other actions as needed
        console.log("data" + data);
      })
      .catch((error) => {
        // Handle errors here
        console.error("There was a problem with the fetch operation:", error);
      }); */

    /* thisForm.querySelector(".sent-message").innerHTML = `Thank you so much! I'll keep an eye on my inbox for your response. 😊💫<br>I'll revert back on ${userEmail}`;
    // thisForm.querySelector(".sent-message").insertAdjacentHTML("beforeend", " " + userEmail);
    thisForm.querySelector(".loading").classList.remove("d-block");
    thisForm.querySelector(".sent-message").classList.add("d-block");
    thisForm.reset(); */

    /* fetch(action, {
      method: 'POST',
      body: formData,
      headers: {'X-Requested-With': 'XMLHttpRequest'}
    })
    .then(response => {
      if( response.ok ) {
        return response.text()
      } else {
        throw new Error(`${response.status} ${response.statusText} ${response.url}`); 
      }
    })
    .then(data => {
      thisForm.querySelector('.loading').classList.remove('d-block');
      if (data.trim() == 'OK') {
        thisForm.querySelector('.sent-message').classList.add('d-block');
        thisForm.reset(); 
      } else {
        throw new Error(data ? data : 'Form submission failed and no error message returned from: ' + action); 
      }
    })
    .catch((error) => {
      displayError(thisForm, error);
    }); */
  }

  function displayError(thisForm, error) {
    thisForm.querySelector(".loading").classList.remove("d-block");
    thisForm.querySelector(".error-message").innerHTML = error;
    thisForm.querySelector(".error-message").classList.add("d-block");
    thisForm.reset();
  }
})();
