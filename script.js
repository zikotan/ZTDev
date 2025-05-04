const header = document.querySelector("header");

window.addEventListener("scroll", function () {
  header.classList.toggle("sticky", this.window.scrollY > 30)
});
let menu = document.querySelector("#menu-icon");
let navlist = document.querySelector('.navlist');

// Mine
menu.onclick = (event) => {
  menu.classList.toggle('bx-x');
  navlist.classList.toggle('active');
}

window.addEventListener('click', function (e) {
  const isClickInsideMenu = navlist.contains(e.target);
  const isClickOnMenuIcon = menu.contains(e.target);

  if (!isClickInsideMenu && !isClickOnMenuIcon) {
    menu.classList.remove('bx-x');
    navlist.classList.remove('active');
  }
});

// His
// menu.onclick = () => {
//   menu.classList.toggle('bx-x');
//   navlist.classList.toggle('active');
// }

// window.onclick = () => {
//   menu.remove.toggle('bx-x');
//   navlist.remove.toggle('active');
// }

// Function to keep my videos adapt to all screens
function resizeIframeProportionally() {
  const iframe = document.querySelector('#video-container iframe');
  if (!iframe) return;

  const aspectRatio = 0.471;

  const newWidth = iframe.offsetWidth;
  const newHeight = newWidth * aspectRatio;

  iframe.style.height = `${newHeight}px`;
}

// Attach listener for real-time resizing
window.addEventListener('resize', resizeIframeProportionally);
window.addEventListener('load', resizeIframeProportionally);


function showVideoPopup(videoSrc) {
  const popup = document.getElementById('video-popup');
  const container = document.getElementById('video-container');

  // Clear previous content
  container.innerHTML = '';

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.src = videoSrc;
  iframe.allow = 'autoplay';
  iframe.allowFullscreen = true;
  iframe.frameBorder = 0;

  // Append iframe
  container.appendChild(iframe);

  // Show popup
  popup.style.display = 'flex';

  // Resize immediately after adding
  resizeIframeProportionally();

  // Close when clicking outside
  popup.addEventListener('click', function (e) {
    if (e.target === popup) {
      closeVideoPopup();
    }
  });
}

function closeVideoPopup() {
  const popup = document.getElementById('video-popup');
  const container = document.getElementById('video-container');

  // Remove iframe
  container.innerHTML = '';

  // Hide popup
  popup.style.display = 'none';
}

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeVideoPopup();
  }
});


// Wait for the DOM to load before executing the script
document.addEventListener('DOMContentLoaded', async () => {
  const userAgent = navigator.userAgent || '';
  const touchSupport = 'ontouchstart' in window;
  const colorDepth = screen.colorDepth || '';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localStorageSupport = typeof (Storage) !== "undefined";
  const indexedDbSupport = typeof (window.indexedDB) !== "undefined";
  const sessionStorageSupport = typeof (window.sessionStorage) !== "undefined";

  // Concatenate all values into a single string
  const fingerprint = `${userAgent}➡${touchSupport}➡${colorDepth}➡${timezone}➡${localStorageSupport}➡${indexedDbSupport}➡${sessionStorageSupport}`;

  document.getElementById("contactForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.send-btn');
    const originalText = submitBtn.textContent;
    const originalClass = submitBtn.className;
    const scriptUrl = "https://script.google.com/macros/s/AKfycby6RQXNqMZHiRJsgLc_WI6fz2z8QVskFJhSMCq-cVC-D3V4Y9EUd90cO_pz_GPhtwiv/exec";

    // Set loading state
    submitBtn.textContent = "Sending";
    submitBtn.className = originalClass + " sending";
    submitBtn.disabled = true;

    // Attempt to get the userID from localStorage
    let userID = localStorage.getItem("userID");

    try {
      // Send the form data along with the userID (if available) and the fingerprint
      const response = await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify({
          name: form.name.value,
          email: form.email.value,
          message: form.message.value,
          userID: userID, // Send the userID if available (could be null)
          fingerprint: fingerprint // Send the fingerprint value
        })
      });

      // Parse the JSON response
      const result = await response.json();

      // If the userID is returned by Google Apps Script and it's not saved in localStorage, save it
      if (result.userID && !localStorage.getItem("userID")) {
        localStorage.setItem("userID", result.userID);
        userID = result.userID; // Update the userID to the one returned by the script
      }

      // Check if the result is a disposable email error
      if (result.result === "error") {
        if (result.type === "disposable_email") {
          showAlert(result.message || "Disposable Email");
          submitBtn.className = originalClass + " error";
          submitBtn.textContent = "Error";
          return;
        }

        throw new Error(result.message || "Submission failed");
      }


      // If no error, proceed as successful
      showAlert("Message Sent Sucssefuly ☑️");
      submitBtn.className = originalClass + " success";
      submitBtn.textContent = "Sent";

    } catch (error) {
      // Handle errors by showing an alert and an "Error"
      showAlert();
      submitBtn.className = originalClass + " error";
      submitBtn.textContent = "Error";
    } finally {
      setTimeout(() => {
        // Restore original state after 1.25 seconds
        submitBtn.textContent = originalText;
        submitBtn.className = originalClass;
        submitBtn.disabled = false;
      }, 1250);
    }
  });
});

function showAlert(message) {
  const customAlert = document.getElementById('customAlert');
  const alertMessage = customAlert.querySelector('.alert-message');
  const alertOptions = customAlert.querySelector('.alert-options'); // Get options container
  const alertBox = customAlert.querySelector('.alert-box');
  const alertClose = customAlert.querySelector('.alert-close');

  // Show alert
  customAlert.style.display = 'flex';
  customAlert.classList.remove("hide");

  // Reset message to default
  alertMessage.innerHTML = `<span style="vertical-align: 1px;">⚠️</span>You have exceeded the maximum number of submissions. Please choose another option:`;
  if (!message || message === "Disposable Email") {
    alertBox.style.boxShadow = "";
    alertBox.style.borderColor = "";
    alertOptions.style.display = '';
    alertClose.style.display = '';
    if (message === "Disposable Email") {
      alertMessage.textContent = `🚫 Disposable or temporary email addresses are not allowed. Please use a valid email, Or choose another option:`;
      return;
    }
    return;
  }

  if (message === "Message Sent Sucssefuly ☑️") {
    document.getElementById("contactForm").reset();
    alertMessage.textContent = message;
    let countdown = 5;

    alertBox.style.boxShadow = "0 0 100000px green";
    alertBox.style.borderColor = "green";
    // Hide options (if needed) and set countdown message
    alertOptions.style.display = 'none'; // Hide options
    alertClose.style.display = 'none';
    alertMessage.innerHTML = `${message}<br><br>disappearing in ${countdown}s`;

    const countdownInterval = setInterval(() => {
      countdown--;
      alertMessage.innerHTML = `${message}<br><br>disappearing in ${countdown}s`;

      if (countdown <= 0) {
        clearInterval(countdownInterval);
        hideAlert();
      }
    }, 1000);
    return;
  }
}

// Function to hide the custom alert
function hideAlert() {
  const customAlert = document.getElementById('customAlert');
  customAlert.classList.add("hide");
  setTimeout(() => {
    customAlert.style.display = 'none';
  }, 500); // Match your animation duration (in ms)
}
