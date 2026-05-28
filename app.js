// Runtime reference holder for the Google Maps API Key
let GOOGLE_API_KEY = "YOUR_API_KEY";

/**
 * Initializes and configures the Places Autocomplete listener
 */
function setupAutocomplete() {
    const addressInput = document.getElementById("address");
    if (!addressInput) return;
    
    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
        types: ["geocode"], 
        componentRestrictions: { country: "us" } 
    });
   
    autocomplete.addListener("place_changed", function () {
        const place = autocomplete.getPlace();
        if (!place.address_components) return;
       
        let addressComponents = {};
        place.address_components.forEach(component => { 
            addressComponents[component.types[0]] = component.long_name; 
        });
       
        document.getElementById("city").value = addressComponents["locality"] || ""; 
        document.getElementById("state").value = addressComponents["administrative_area_level_1"] || ""; 
        document.getElementById("zip").value = addressComponents["postal_code"] || ""; 
    });
}

/**
 * Global API entry callback. Resolves page rendering race conditions.
 */
function initAutocomplete() {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupAutocomplete);
    } else {
        setupAutocomplete();
    }
}

/**
 * Executes a validation transaction against the Google Address Validation API
 */
function validateAddress() {
    const address = document.getElementById("address").value;
    const aptUnit = document.getElementById("aptUnit").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const zip = document.getElementById("zip").value;

    const enteredAddressForDisplay = `${address} ${aptUnit}, ${city}, ${state} ${zip}`.trim();

    if (!address) {
        alert("Please enter a street address.");
        return;
    }

    const validationApiUrl = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${GOOGLE_API_KEY}`;

    fetch(validationApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            "address": { 
                "regionCode": "US",
                "languageCode": "en",
                "addressLines": [`${address} ${aptUnit}`, `${city} ${state} ${zip}`.trim()].filter(Boolean) 
            },
            "enableUspsCass": true
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error?.message || `API Error: ${response.status}`) });
        }
        return response.json();
    })
    .then(data => {
        // Evaluate if location expects a subpremise (Apt, Suite, Unit) but none was provided
        if (data.result && data.result.verdict && data.result.verdict.possibleNextAction === "CONFIRM_ADD_SUBPREMISES" && !aptUnit) {
            showSubPremiseModal();
            return; 
        }

        if (data.result && data.result.address) {
            showValidationModal(data.result.address.formattedAddress, enteredAddressForDisplay);
        } else {
            alert("Could not validate address. Please check the details and try again.");
        }
    })
    .catch(error => {
        console.error("Address validation error:", error);
        alert(`An error occurred while validating the address: ${error.message}`);
    });
}

function showValidationModal(recommendedAddress, enteredAddress) {
    const modalBody = document.getElementById("modal-body");
    if (!modalBody) return;
    
    const escapeHtml = (unsafe) => {
        if (typeof unsafe !== 'string') return '';
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    };

    const safeEnteredAddress = escapeHtml(enteredAddress);
    const safeRecommendedAddress = escapeHtml(recommendedAddress);

    modalBody.innerHTML = `
        <p class="mb-4 text-sm text-gray-600">To ensure accurate delivery timelines, please confirm your address format:</p>
        <label><input type='radio' name='addressOption' value='entered' checked> <span>You entered:</span><br><strong class="ml-5 text-gray-800">${safeEnteredAddress}</strong></label>
        <label><input type='radio' name='addressOption' value='recommended'> <span class="text-orange-600 font-semibold">Recommended layout:</span><br><strong class="ml-5 text-gray-800">${safeRecommendedAddress}</strong></label>
        <button class='btn-primary mt-4' onclick='confirmAddress()'>Confirm & Continue</button> 
    `; 
    document.getElementById("modal").classList.add("active"); 
}

function showSubPremiseModal() {
    const modal = document.getElementById("sub-premise-modal");
    if (modal) modal.classList.add("active");
}

function closeSubPremiseModal() {
    const modal = document.getElementById("sub-premise-modal");
    if (modal) modal.classList.remove("active");
}

function confirmAddress() {
    document.getElementById("modal").classList.remove("active"); 
    alert("Address successfully verified!");
}

// Automatically sync script parameter key changes to runtime memory configurations
window.addEventListener('load', () => {
    const scriptTag = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (scriptTag) {
        const urlParams = new URLSearchParams(scriptTag.src.split('?')[1]);
        const key = urlParams.get('key');
        if (key && key !== "YOUR_API_KEY") {
            GOOGLE_API_KEY = key;
        }
    }
});
