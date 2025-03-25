//API configurations
import {API_KEY, API_URL} from './config.js';

console.log("API Key Loaded:", API_KEY ? " Successful" : "Failed");
console.log("API Base URL:", API_URL);

//listen for page load
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM has loaded and parsed")
    const form = document.getElementById("dog-form");
    const dogimg = document.getElementById("dog-image");

    dogimg.style.display = "none"; //on load, hide image
    form.addEventListener("submit", function(event) {
        event.preventDefault()
        console.log("form submited successfully")

        //Get the user's input value
        const searchInput = document.getElementById("search").value.trim()
        
        if(searchInput === "") {
            console.log("error: search input is empty")
            return;
        }
        console.log("breed loading...:", searchInput)
        fetchDogs(searchInput); 
    })
})

//fetchdogs function - fetching the breed url and responding to fetch errors

async function fetchDogs(breedName) {
    const url = `${API_URL}/breeds/search?q=${breedName}`;
    console.log("Fetching info from:", url);

    try {
        const response = await fetch(url, {
            headers: { "x-api-key": API_KEY }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API response:", data);

        // Get elements
        const breedlist = document.getElementById("breed-list");
        const breedInfo = document.getElementById("breed-info");
        breedInfo.textContent = "Loading...";
        breedInfo.classList.add("loading");
        const dogimg = document.getElementById("dog-image");

        breedlist.innerHTML = ""; // Clear previous search results
        breedInfo.classList.remove("loading")
        breedInfo.textContent = ""; // Clear previous breed info
        dogimg.style.display = "none"

        if (data.length === 0) { 
            breedlist.innerHTML = "<li>No breeds found. Try another name.</li>";
            breedInfo.textContent = "No breed information available.";
            return;
        }

        displayBreedList(data); // Show breed results
    } catch (error) {
        console.error("Problem fetching data:", error);
        alert("Error fetching breeds. Please check your connection and try again.");
    }
}


//displaying breed result/s on UI
//updating breedlist, breed info, and dog-image
function displayBreedList(breeds) {
    const breedlist = document.getElementById("breed-list");
    breedlist.innerHTML = ""; 

    breeds.forEach(breed => {
        const listItem = document.createElement("li");
        listItem.textContent = breed.name;

        // Add active class on click
        listItem.addEventListener("click", () => {
            document.querySelectorAll("#breed-list li").forEach(li => li.classList.remove("active"));
            listItem.classList.add("active");
            fetchBreedInfo(breed.id);
        });

        breedlist.appendChild(listItem);
    });
}


//after clicking on a breed name, fetch the breed's image and info
async function fetchBreedInfo(breedId) {
    const url = `${API_URL}/breeds/${breedId}`;

    try {
        const response = await fetch(url, {
            headers: { "x-api-key": API_KEY }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const breed = await response.json(); // API returns a single breed object
        console.log("Breed details response:", breed);

        // Fetch the image separately using `reference_image_id`
        if (breed.reference_image_id) {
            fetchBreedImage(breed.reference_image_id, breed);
        } else {
            displayBreedData(breed, null); // No image available
        }

    } catch (error) {
        console.error("Problem fetching breed details:", error);
        alert("Failed to fetch breed details. Please try again.");
    }
}

//fetch the image url because its outside the id
async function fetchBreedImage(imageId, breed) {
    const url = `${API_URL}/images/${imageId}`;

    try {
        const response = await fetch(url, {
            headers: { "x-api-key": API_KEY }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const imageData = await response.json();
        console.log("Breed image response:", imageData);

        displayBreedData(breed, imageData.url);
    } catch (error) {
        console.error("Problem fetching breed image:", error);
        displayBreedData(breed, null);
    }
}


//to show the breed details on the screen
function displayBreedData(breed, imageUrl) {
    const breedInfo = document.getElementById("breed-info");
    const dogimg = document.getElementById("dog-image");

    // Clear previous content
    breedInfo.innerHTML = "";

    // Display breed details
    breedInfo.innerHTML = `
        <h2>${breed.name}</h2>
        <p><strong>Bred for:</strong> ${breed.bred_for || "Not available"}</p>
        <p><strong>Breed group:</strong> ${breed.breed_group || "Not available"}</p>
        <p><strong>Life Span:</strong> ${breed.life_span || "Not available"}</p>
        <p><strong>Temperament:</strong> ${breed.temperament || "Not available"}</p>
    `;

    // Show image if available
    if (imageUrl) {
        dogimg.src = imageUrl;
        dogimg.alt = breed.name;
        dogimg.style.display = "block"; //if image exist, display it
    } else {
        dogimg.style.display = "none"; //hide if not
    }

    console.log("Displayed details:", breed.name);
}





