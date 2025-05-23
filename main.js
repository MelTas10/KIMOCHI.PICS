document.addEventListener("DOMContentLoaded", () => {
    // Configuration
    const girls = [
        "https://files.catbox.moe/mc1yub.png",
        "https://files.catbox.moe/q0njjx.png",
        "https://files.catbox.moe/0qbkl3.png",
        "https://files.catbox.moe/e17iyc.png",
        "https://files.catbox.moe/rpcsff.png",
        "https://files.catbox.moe/9tyauh.png",
        "https://files.catbox.moe/fcnus0.png",
        "https://files.catbox.moe/3vnr1x.png"
    ];

    // DOM Elements
    const animeGirl = document.getElementById("anime-girl");
    const uploadArea = document.getElementById("upload-area");
    const fileInput = document.getElementById("file-input");
    const uploadBtn = document.getElementById("upload-btn");
    const loading = document.getElementById("loading");
    const result = document.getElementById("result");
    const progressText = document.getElementById("progress");
    const loadingBar = document.getElementById("loading-bar");
    const privacyLink = document.getElementById("privacy-link");
    const privacyModal = document.getElementById("privacy-modal");
    const closeModal = document.getElementById("close-modal");

    // Anime girl rotation
    let currentGirl = Math.floor(Math.random() * girls.length);
    animeGirl.src = girls[currentGirl];
    
    function changeGirl() {
        currentGirl = (currentGirl + 1) % girls.length;
        animeGirl.src = girls[currentGirl];
        setTimeout(changeGirl, 3000 + Math.random() * 7000);
    }
    setTimeout(changeGirl, 5000);

    // File upload handling
    uploadArea.addEventListener("click", () => fileInput.click());

    uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.style.animation = "none";
        uploadArea.style.borderColor = "#ff6b9d";
        uploadArea.style.background = "rgba(255, 214, 224, 0.3)";
    });

    uploadArea.addEventListener("dragleave", () => {
        uploadArea.style.animation = "borderPulse 2s infinite";
        uploadArea.style.borderColor = "#aaa";
        uploadArea.style.background = "transparent";
    });

    uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadArea.style.animation = "borderPulse 2s infinite";
        uploadArea.style.borderColor = "#aaa";
        uploadArea.style.background = "transparent";
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            updateFileInfo();
        }
    });

    fileInput.addEventListener("change", updateFileInfo);

    function updateFileInfo() {
        if (fileInput.files.length) {
            const file = fileInput.files[0];
            uploadArea.querySelector("p").textContent = 
                `📄 ${file.name} (${formatFileSize(file.size)})`;
        }
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    // Upload functionality
    uploadBtn.addEventListener("click", uploadFile);

    function uploadFile() {
        if (!fileInput.files.length) {
            showResult("Please select a file first!", "error");
            return;
        }

        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append("file", file);

        loading.style.display = "block";
        result.innerHTML = "";
        loadingBar.style.width = "0%";
        progressText.textContent = "0%";

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/upload", true);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressText.textContent = `${percent}%`;
                loadingBar.style.width = `${percent}%`;
            }
        };

        xhr.onload = () => {
            loading.style.display = "none";
            
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    showResult(`
                        <p>File uploaded successfully! 🎉</p>
                        <p>URL: <a href="${response.url}" target="_blank">${response.url}</a></p>
                        <button onclick="copyToClipboard('${response.url}')" class="btn copy-btn">
                            Copy URL
                        </button>
                    `, "success");
                } else {
                    showResult(`Upload failed: ${response.error}`, "error");
                }
            } else {
                showResult(`Upload failed: ${xhr.statusText}`, "error");
            }
        };

        xhr.onerror = () => {
            loading.style.display = "none";
            showResult("Network error occurred", "error");
        };

        xhr.send(formData);
    }

    function showResult(message, type) {
        result.innerHTML = message;
        result.className = "result " + type;
    }

    // Modal handling
    privacyLink.addEventListener("click", (e) => {
        e.preventDefault();
        privacyModal.style.display = "flex";
    });

    closeModal.addEventListener("click", () => {
        privacyModal.style.display = "none";
    });

    // Copy to clipboard function
    window.copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            const copyBtns = document.querySelectorAll(".copy-btn");
            copyBtns.forEach(btn => {
                btn.textContent = "Copied!";
                setTimeout(() => btn.textContent = "Copy URL", 2000);
            });
        });
    };
});
