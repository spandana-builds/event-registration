require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const Registration = require("./models/Registration");

const app = express();
app.use(cors());
app.use(express.json());

// ================== EMAIL CONFIG ==================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ================== ROUTES ==================

// Health check
app.get("/", (req, res) => {
  res.send("Event Registration Backend Running");
});

// -------- REGISTER (with duplicate prevention) --------
app.post("/register", async (req, res) => {
  try {
    let { name, email, phone, college, event } = req.body;

    // 🔹 Normalize inputs
    email = email.toLowerCase().trim();
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    // 🔒 Strong duplicate check (email OR phone per event)
    const existing = await Registration.findOne({
      event,
      $or: [
        { email },
        { phone: cleanPhone }
      ]
    });

    if (existing) {
      return res.status(400).json({
        message: "You have already registered for this event"
      });
    }

    // 💾 Save registration
    await Registration.create({
      name,
      email,
      phone: cleanPhone,
      college,
      event
    });

    // 📧 Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Event Registration Confirmation",
      html: `
        <h3>Hi ${name},</h3>
        <p>You have successfully registered for <b>${event}</b>.</p>
        <p><b>College:</b> ${college}</p>
        <p><b>Phone:</b> ${cleanPhone}</p>
        <br/>
        <p>Thank you for registering!</p>
      `
    });

    res.status(201).json({
      message: "Registration successful. Confirmation email sent."
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// -------- ADMIN: VIEW REGISTRATIONS --------
app.get("/registrations", async (req, res) => {
  try {
    const registrations = await Registration.find()
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    console.error("FETCH ERROR:", error);
    res.status(500).json({ message: "Failed to fetch registrations" });
  }
});

// -------- ADMIN: DELETE REGISTRATION --------
app.delete("/registrations/:id", async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: "Registration deleted" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Delete failed" });
  }
});

// -------- ADMIN: DOWNLOAD CSV --------
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
    console.error("CSV ERROR:", error);
    res.status(500).send("Failed to generate CSV");
  }
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("DB CONNECTION FAILED:", error);
  }
}

startServer();
