const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Registration = require("./models/Registration");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/eventDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Event Registration Backend Running");
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, college, event } = req.body;

    const existing = await Registration.findOne({ email, event });
    if (existing) {
      return res.status(400).json({ message: "Already registered for this event" });
    }

    await new Registration({ name, email, phone, college, event }).save();
    res.status(201).json({ message: "Registration successful" });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all registrations (Admin)
app.get("/registrations", async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
});

// Delete registration by ID (Admin)
app.delete("/registrations/:id", async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: "Registration deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// Download registrations as CSV
app.get("/registrations/csv", async (req, res) => {
  try {
    const registrations = await Registration.find();

    let csv = "Name,Email,Phone,College,Event\n";

    registrations.forEach(r => {
      csv += `${r.name},${r.email},${r.phone},${r.college},${r.event}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("event_registrations.csv");
    res.send(csv);

  } catch (error) {
    res.status(500).send("Failed to generate CSV");
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
