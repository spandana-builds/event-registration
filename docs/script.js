const BASE_URL = "https://event-registration-3d1q.onrender.com";

document
  .getElementById("registrationForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const messageEl = document.getElementById("message");
    messageEl.innerText = "Submitting...";

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

      // ✅ SUCCESS
      if (response.ok) {
        messageEl.style.color = "green";
        messageEl.innerText = result.message;
        document.getElementById("registrationForm").reset();
      } 
      // ❌ DUPLICATE / VALIDATION ERROR
      else {
        messageEl.style.color = "red";
        messageEl.innerText = result.message;
      }

    } catch (err) {
      console.error(err);
      messageEl.style.color = "red";
      messageEl.innerText = "Server error. Please try again.";
    }
  });
