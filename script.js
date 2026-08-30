const imageInput = document.getElementById("imageInput");
const audioInput = document.getElementById("audioInput");

const imagePreview = document.getElementById("imagePreview");
const audioPreview = document.getElementById("audioPreview");

const saveButton = document.getElementById("saveButton");
const deleteButton = document.getElementById("deleteButton");
const message = document.getElementById("message");

let db;

// Open IndexedDB
const request = indexedDB.open("MediaStorage", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;

  if (!db.objectStoreNames.contains("files")) {
    db.createObjectStore("files");
  }
};

request.onsuccess = function (event) {
  db = event.target.result;

  // Load previously saved files
  loadFiles();
};

request.onerror = function () {
  showMessage("Could not open browser storage.", "red");
};


// Preview selected image
imageInput.addEventListener("change", function () {
  const file = imageInput.files[0];

  if (!file) return;

  const url = URL.createObjectURL(file);

  imagePreview.src = url;
  imagePreview.style.display = "block";
});


// Preview selected audio
audioInput.addEventListener("change", function () {
  const file = audioInput.files[0];

  if (!file) return;

  const url = URL.createObjectURL(file);

  audioPreview.src = url;
  audioPreview.style.display = "block";
});


// Save files
saveButton.addEventListener("click", function () {

  const image = imageInput.files[0];
  const audio = audioInput.files[0];

  if (!image) {
    showMessage("Please choose an image.", "red");
    return;
  }

  if (!audio) {
    showMessage("Please choose an audio file.", "red");
    return;
  }

  const transaction = db.transaction("files", "readwrite");
  const store = transaction.objectStore("files");

  store.put(image, "image");
  store.put(audio, "audio");

  transaction.oncomplete = function () {
    showMessage("Image and audio saved successfully!", "green");
  };

  transaction.onerror = function () {
    showMessage("Could not save the files.", "red");
  };
});


// Load saved files
function loadFiles() {

  const transaction = db.transaction("files", "readonly");
  const store = transaction.objectStore("files");

  const imageRequest = store.get("image");

  imageRequest.onsuccess = function () {

    const image = imageRequest.result;

    if (image) {
      const url = URL.createObjectURL(image);

      imagePreview.src = url;
      imagePreview.style.display = "block";
    }
  };


  const audioRequest = store.get("audio");

  audioRequest.onsuccess = function () {

    const audio = audioRequest.result;

    if (audio) {
      const url = URL.createObjectURL(audio);

      audioPreview.src = url;
      audioPreview.style.display = "block";
    }
  };
}


// Delete files
deleteButton.addEventListener("click", function () {

  const transaction = db.transaction("files", "readwrite");
  const store = transaction.objectStore("files");

  store.delete("image");
  store.delete("audio");

  transaction.oncomplete = function () {

    imagePreview.src = "";
    imagePreview.style.display = "none";

    audioPreview.src = "";
    audioPreview.style.display = "none";

    imageInput.value = "";
    audioInput.value = "";

    showMessage("Files deleted.", "green");
  };
});


// Message helper
function showMessage(text, color) {
  message.textContent = text;
  message.style.color = color;
}
