const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");

const app = express();
const PORT = 3000;

// MongoDB setup
mongoose.connect("mongodb://localhost:27017/kimochi", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const File = mongoose.model("File", {
    filename: String,
    originalName: String,
    size: Number,
    uploadDate: { type: Date, default: Date.now },
});

// Multer storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "uploads/";
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const randomName = Math.random().toString(36).substring(2, 10);
        cb(null, `${randomName}${ext}`);
    },
});

const upload = multer({ storage });

// Serve static files
app.use(express.static("public"));

// Upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) throw new Error("No file uploaded");

        const newFile = new File({
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
        });

        await newFile.save();

        res.json({
            success: true,
            url: `https://files.kimochi.pics/${req.file.filename}`,
        });
    } catch (err) {
        res.json({
            success: false,
            error: err.message,
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
