require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Registration = require("./models/Registration");

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
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

    await Registration.create({ name, email, phone, college, event });
    res.status(201).json({ message: "Registration successful" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/registrations", async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
});

app.delete("/registrations/:id", async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: "Registration deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

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
    console.error("CSV ERROR:", err);
    res.status(500).send("Failed to generate CSV");
  }
});

// 🚀 START SERVER ONLY AFTER DB CONNECTS
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("DB CONNECTION FAILED:", err);
  }
}

startServer();
