const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB setup
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/kimochi", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const File = mongoose.model("File", {
    filename: String,
    originalName: String,
    size: Number,
    uploadDate: { type: Date, default: Date.now },
});

// File storage configuration
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

const upload = multer({ 
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// File upload endpoint
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: "No file uploaded" 
            });
        }

        const newFile = new File({
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
        });

        await newFile.save();

        res.json({
            success: true,
            url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
            filename: req.file.filename
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// File retrieval endpoint
app.get("/file/:filename", async (req, res) => {
    try {
        const file = await File.findOne({ filename: req.params.filename });
        if (!file) {
            return res.status(404).json({ error: "File not found" });
        }
        res.sendFile(path.join(__dirname, 'uploads', req.params.filename));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
