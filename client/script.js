document.getElementById("registrationForm").addEventListener("submit", function (e) {
  e.preventDefault();
  document.getElementById("message").innerText = "Form submitted successfully!";
});
