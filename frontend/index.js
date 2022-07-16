const imageInput = document.getElementById("imageinput");
const image = document.getElementById("image");
const finalImage = document.getElementById("finalimage");
const proxyinput = document.getElementById("proxyinput");
const processBtn = document.getElementById("btn-process");

let file;

proxyinput.onclick = (e) => {
  imageInput.click();
};

function readFileAsync(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadToStore(image) {
  const formData = new FormData();
  formData.append("image", image);
  try {
    let response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    });
    return await response.json();
  } catch (error) {
    throw "Fetch request give some error";
  }
}

async function blurImage(faceCoordinate, imageUrl) {
  try {
    let blurimageResponse = await fetch("http://localhost:5000/mogrify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: imageUrl,
        coord: faceCoordinate,
      }),
    });

    return blurimageResponse.json();
  } catch (error) {
    throw "Blur image function is not working";
  }
}

async function facedetect(imageurl) {
  try {
    let faceDetectionResult = await fetch("http://localhost:5000/facedetect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: imageurl,
      }),
    });

    let tempjson = await faceDetectionResult.json();
    return tempjson.faces;
  } catch (error) {
    throw "Face detection not working";
  }
}

imageInput.addEventListener("change", async (e) => {
  const fileList = e.target.files;
  if (fileList.length > 0) {
    let data = await readFileAsync(fileList[0]);
    image.src = data;
    file = fileList[0];
  }
});

processBtn.onclick = async () => {
  if (file) {
    let imageUploadResponse = await uploadToStore(file);
    if (imageUploadResponse["ssl_link"]) {
      let faceCoordinates = await facedetect(imageUploadResponse["ssl_link"]);
      if (faceCoordinates) {
        let blurimage = await blurImage(
          faceCoordinates,
          imageUploadResponse["ssl_link"]
        );
        finalImage.src = blurimage["ssl_link"];
      }
    }
  } else {
    throw "No file present to process";
  }
};
