$(document).ready(function () {
  const ENDPOINT = "http://localhost:3000/v1/";
  const CAT_FREEAPIKey =
    " live_RCnAki5Wkxs3Vkdoty1BEbsalC7gfhAgVB2UJQsJ6gDux3hyDmf0Al8N9f8AAPiZ ";
  let restaurantData = [];

  const apiUrl = `https://api.thecatapi.com/v1/images/search?limit=10&api_key=${CAT_FREEAPIKey}`;

  // Function to fetch cat images from the API
  function fetchCatImages() {
    console.log("restaurantData : ", restaurantData);
    $.ajax({
      url: apiUrl,
      method: "GET",
      success: function (data) {
        const catList = $("#catList");
        catList.empty();
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          restaurantData.length > 0
        ) {
          // Loop through the fetched cat images
          restaurantData.forEach(function (restaurant, index) {
            // Create an info-card div for each cat
            const infoCard = `
                <div class="info-card">
                  <div class="front card-image" style="background-image:url('${data[index].url}')">
                  </div>
                  <div class="back bg-body text-body">
                    <h2>${restaurant.name}</h2>
                    <p>
                    ${restaurant.address}
                    </p>
                    
                    <div class="social">
                    <a href="#" class="social-icon animate">${restaurant.category}</a>
                    </div>
                    <button class="btn btn-primary btn-choose" id="chooseThisAsLunch" data-id="${restaurant.id}">
                        Choose This as lunch
                    </button>
                  </div>
                </div>`;

            // Append the info-card to the catList container
            $("#catList").append(infoCard);
          });

          $(".btn-choose").click(function () {
            chooseRestaurantId = $(this).data("id");
            console.log("chooseRestaurantId : ", chooseRestaurantId);
          });
        }
      },
      error: function (error) {
        console.error("Error fetching cat images: ", error);
      },
    });
  }

  $("#findFood").on("click", async function () {
    await getRestaurantData(1);
    fetchCatImages();
  });

  // Function to retrieve restaurant data from the API
  function getRestaurantData(page) {
    return new Promise(function (resolve, reject) {
      const apiEndpoint = ENDPOINT + "restaurants";

      const filterName = $("#filter_name").val();
      const filterAddress = $("#filter_address").val();
      const filterCategory = $("#filter_category").val();

      // Initialize an empty query string
      let queryString = "";

      // Conditionally add filter parameters to the query string
      if (filterName) {
        queryString += `name=${filterName}&`;
      }
      if (filterAddress) {
        queryString += `address=${filterAddress}&`;
      }
      if (filterCategory) {
        queryString += `category=${filterCategory}&`;
      }

      // Remove the trailing '&' character
      queryString = queryString.slice(0, -1);

      // Construct the URL for the API endpoint
      const apiUrl = apiEndpoint + (queryString ? `?${queryString}` : "");

      $.ajax({
        url: apiUrl,
        method: "GET",
        data: { page: page },
        success: function (data) {
          restaurantData = data.results;
          toggleRestaurantResults(data.totalResults);

          resolve(data); // Resolve the promise with the data
        },
        error: function (error) {
          console.log("Error fetching data: ", error);
          reject(error); // Reject the promise with an error
        },
      });
    });
  }

  $("#resetFilter").on("click", async function () {
    clearFilter();
    await getRestaurantData(1);
    fetchCatImages();
  });

  async function init() {
    clearFilter();
    await getRestaurantData(1);
    fetchCatImages();
  }

  init();

  function toggleRestaurantResults(total) {
    const restaurantTotalElement = document.getElementById("restaurantTotal");
    restaurantTotalElement.innerHTML = `Showing ${
      total > 10 ? 10 : total
    } matched random Restaurant `;
  }

  function clearFilter() {
    $("#filter_name").val("");
    $("#filter_address").val("");
    $("#filter_category").val("");
  }
});
