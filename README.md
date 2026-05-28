# Google_Maps_Platform_Autocomplete_with_Address_Validation
This demo utilizes Google Maps Platform's Autocomplete + Address Validation services for a customer checkout experience. 

# The Home Depot - Address Verification UX Demo
This single-page concept application showcases how **Google Places Autocomplete** and the **Google Address Validation API** can be seamlessly integrated into a simplified checkout flow tailored for **The Home Depot**.

## Visual Design Choices
* **Branding:** Styled with The Home Depot’s corporate orange identity (`#F96302`).
* **UX Enhancements:** Focus states, transitions, modal layouts, and user interactions mirror standard checkout requirements.

## Architecture & Logic Flow
1. **Asynchronous Initializer:** Handles race conditions where the Maps script finishes loading before the DOM tree finishes rendering.
2. **Dynamic Key Mapping:** The application dynamically reads the configuration details in the HTML script tag to power backend JSON-POST requests, meaning you only need to swap the API key in **one place**.

## Setup Instructions

1. Save the project files (`index.html`, `style.css`, and `app.js`) together inside the same local folder directory.
2. Open `index.html` in a text editor and scroll to the bottom.
3. Locate the Google script tag and replace `YOUR_API_KEY` with your actual Google Maps API key:
   ```html
   <script src="[https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initAutocomplete](https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initAutocomplete)" async defer></script>

**Open index.html directly inside a browser to execute the demonstration.**

**Required Google Cloud Dashboard Settings**
To prevent request errors (such as 403 Forbidden messages), verify that the API Key configured in your project has the following parameters allowed inside the Google Cloud Console:

API Library: Both Places API and Address Validation API must be set to Enabled.

API Restrictions: Under APIs & Services > Credentials, your key restriction rules must allow requests targeting both services.

HTTP Referrer Restrictions: If testing locally as a raw file (e.g., file://...), temporarily remove website layout domain restrictions to allow local sandbox evaluations.
