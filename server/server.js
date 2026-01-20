require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Registration = require("./models/Registration");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// ROUTES FIRST 👇

// health check
app.get("/", (req, res) => {
  res.send("Event Registration Backend Running");
});

// CREATE
app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, college, event } = req.body;

    const existing = await Registration.findOne({ email, event });
    if (existing) {
      return res.status(400).json({ message: "Already registered for this event" });
    }

    await Registration.create({ name, email, phone, college, event });
    res.status(201).json({ message: "Registration successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// READ
app.get("/registrations", async (req, res) => {
  try {
    const registrations = await Registration.find();
    res.json(registrations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
});

// CSV
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

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate CSV");
  }
});

// DELETE
app.delete("/registrations/:id", async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: "Registration deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

// LISTEN LAST 👇
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
