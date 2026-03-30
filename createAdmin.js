const mongoose = require("mongoose");
const Admin = require("./models/admin");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function createAdmin() {
  try {
    // 🔗 Connect DB
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log("✅ Connected to database");

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("❌ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env");
    }

    // 🔍 Check existing admin
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists, deleting...");
      await Admin.deleteOne({ email });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 👨‍💼 Create admin
    const admin = new Admin({
      email: email,
      password: hashedPassword,
    });

    await admin.save();

    console.log("🎉 Admin created successfully!");
    console.log("👉 Email:", email);

  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from database");
  }
}

createAdmin();