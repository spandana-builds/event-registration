const BASE_URL = "https://event-registration-3d1q.onrender.com";

document
  .getElementById("registrationForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      college: document.getElementById("college").value,
      event: document.getElementById("event").value
    };

    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      document.getElementById("message").innerText = result.message;

      if (response.ok) {
        document.getElementById("registrationForm").reset();
      }
    } catch (err) {
      document.getElementById("message").innerText =
        "Server error. Try again.";
    }
  });
