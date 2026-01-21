const BASE_URL = "https://event-registration-3d1q.onrender.com";

function loadRegistrations() {
  fetch(`${BASE_URL}/registrations`)
    .then(res => res.json())
    .then(data => {
      const table = document.getElementById("tableBody");
      table.innerHTML = "";

      data.forEach(reg => {
        table.innerHTML += `
          <tr>
            <td>${reg.name}</td>
            <td>${reg.email}</td>
            <td>${reg.phone}</td>
            <td>${reg.college}</td>
            <td>${reg.event}</td>
            <td>
              <button onclick="deleteRegistration('${reg._id}')">
                Delete
              </button>
            </td>
          </tr>
        `;
      });
    });
}

function deleteRegistration(id) {
  if (!confirm("Delete this registration?")) return;

  fetch(`${BASE_URL}/registrations/${id}`, { method: "DELETE" })
    .then(() => loadRegistrations());
}

function downloadCSV() {
  window.location.href = `${BASE_URL}/registrations/csv`;
}

loadRegistrations();
