$(document).ready(function () {
  const ENDPOINT = window.API_BASE || "http://localhost:3000/v1/";
  const CAT_FREEAPIKey = window.CAT_API_KEY;
  const HOME_SNAPSHOT_KEY = "lunchPickerHome";
  const REFRESH_WINDOW_MS = 20000;
  const REFRESH_MAX_CLICKS = 3;
  let restaurantData = [];
  let matchedTotal = 0;

  const apiUrl = `https://api.thecatapi.com/v1/images/search?limit=10&api_key=${CAT_FREEAPIKey}`;

  function readSnapshot() {
    try {
      return JSON.parse(sessionStorage.getItem(HOME_SNAPSHOT_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function writeSnapshot(partial) {
    const next = Object.assign({}, readSnapshot(), partial);
    sessionStorage.setItem(HOME_SNAPSHOT_KEY, JSON.stringify(next));
  }

  function recentRefreshClicks() {
    const now = Date.now();
    return (readSnapshot().refreshClicks || []).filter(function (clickedAt) {
      return now - clickedAt < REFRESH_WINDOW_MS;
    });
  }

  function secondsUntilRefresh() {
    const clicks = recentRefreshClicks().sort(function (a, b) {
      return a - b;
    });
    if (clicks.length < REFRESH_MAX_CLICKS) {
      return 0;
    }
    return Math.ceil((REFRESH_WINDOW_MS - (Date.now() - clicks[0])) / 1000);
  }

  function updateRefreshButton() {
    const button = $("#refreshCats");
    const waitSeconds = secondsUntilRefresh();
    const hasCards = restaurantData.length > 0;
    if (!hasCards || waitSeconds > 0) {
      button.prop("disabled", true);
      button.text(
        waitSeconds > 0 ? "Refresh cats (" + waitSeconds + "s)" : "Refresh cats"
      );
      return;
    }
    button.prop("disabled", false);
    button.text("Refresh cats");
  }

  function catLoadingMarkup() {
    return `<div class="cat-loading" aria-hidden="true">
      <svg viewBox="0 0 64 64" focusable="false">
        <path fill="currentColor" d="M20 30 12 8l16 14 4-6 4 6 16-14-8 22c8 5 10 16 4 26-6 8-16 10-24 10s-18-2-24-10c-6-10-4-21 4-26z"/>
        <circle cx="26" cy="36" r="2.2" fill="#212529"/>
        <circle cx="38" cy="36" r="2.2" fill="#212529"/>
        <path fill="#f3b6b6" d="M32 40.5 28.5 45h7z"/>
      </svg>
    </div>`;
  }

  function revealCatImage(front, imageUrl) {
    const loader = new Image();
    loader.onload = function () {
      front.style.backgroundImage = "url('" + imageUrl + "')";
      front.classList.add("is-loaded");
    };
    loader.onerror = function () {
      front.classList.add("is-error");
    };
    loader.src = imageUrl;
  }

  function renderCards(restaurants, catUrls) {
    const catList = $("#catList");
    catList.empty();
    restaurants.forEach(function (restaurant, index) {
      const imageUrl = catUrls[index];
      const infoCard = `
                <div class="info-card">
                  <div class="front card-image" data-cat-url="${imageUrl || ""}">
                    ${catLoadingMarkup()}
                  </div>
                  <div class="back bg-body text-body">
                    <h2>${restaurant.name}</h2>
                    <div class="social">
                      <span class="category-tag">${escapeHtml(restaurant.category)}</span>
                    </div>
                    <button class="btn btn-primary btn-choose" data-id="${restaurant._id}">
                        Choose This as lunch
                    </button>
                  </div>
                </div>`;
      catList.append(infoCard);
    });

    $(".btn-choose").click(function () {
      const restaurantId = $(this).data("id");
      const restaurant = restaurantData.find(function (item) {
        return String(item._id) === String(restaurantId);
      });
      if (restaurant) {
        showLunchModal(restaurant);
      }
      chooseRestaurant(restaurantId);
    });

    catList.find(".front").each(function () {
      const imageUrl = this.getAttribute("data-cat-url");
      if (imageUrl) {
        revealCatImage(this, imageUrl);
      }
    });
  }

  function fetchCatImages() {
    if (restaurantData.length > 0) {
      renderCards(restaurantData, []);
    }
    return $.ajax({
      url: apiUrl,
      method: "GET",
    }).then(function (data) {
      const catUrls = Array.isArray(data) ? data.map(function (cat) { return cat.url; }) : [];
      if (catUrls.length > 0 && restaurantData.length > 0) {
        renderCards(restaurantData, catUrls);
        writeSnapshot({
          restaurants: restaurantData,
          catUrls: catUrls,
          total: matchedTotal,
          refreshClicks: recentRefreshClicks(),
        });
      }
      return data;
    }, function (error) {
      console.error("Error fetching cat images: ", error);
    });
  }

  $("#findFood").on("click", async function () {
    await getRandomRestaurantData(1);
    await fetchCatImages();
  });

  $("#refreshCats").on("click", async function () {
    if (secondsUntilRefresh() > 0 || restaurantData.length === 0) {
      updateRefreshButton();
      return;
    }
    writeSnapshot({
      refreshClicks: recentRefreshClicks().concat(Date.now()),
    });
    updateRefreshButton();
    await fetchCatImages();
  });

  function getRandomRestaurantData(page) {
    return new Promise(function (resolve, reject) {
      const apiEndpoint = ENDPOINT + "restaurants/randomRestaurants";

      const filterName = $("#filter_name").val();
      const filterAddress = $("#filter_address").val();
      const filterCategory = $("#filter_category").val();

      let queryString = "";

      if (filterName) {
        queryString += `name=${filterName}&`;
      }
      if (filterAddress) {
        queryString += `address=${filterAddress}&`;
      }
      if (filterCategory) {
        queryString += `category=${filterCategory}&`;
      }

      queryString = queryString.slice(0, -1);

      const randomUrl = apiEndpoint + (queryString ? `?${queryString}` : "");

      $.ajax({
        url: randomUrl,
        method: "GET",
        data: { page: page },
        success: function (data) {
          restaurantData = data.results;
          matchedTotal = data.total;
          toggleRestaurantResults(data.total);
          resolve(data);
        },
        error: function (error) {
          console.log("Error fetching data: ", error);
          reject(error);
        },
      });
    });
  }

  function getRestaurantHistoryData(page) {
    return new Promise(function (resolve, reject) {
      const apiEndpoint = ENDPOINT + "restaurants/restaurantHistory";

      const historyList = $("#history-list");
      historyList.empty();
      $.ajax({
        url: apiEndpoint,
        method: "GET",
        data: { page: page },
        success: function (data) {
          data.forEach(function (history) {
            const formattedDate = formatDate(history.bookingDate);
            historyList.append(
              `<tr>
              <td>${history.restaurant.name}</td>
              <td>${formattedDate}</td>
            </tr>`
            );
          });
          resolve(data);
        },
        error: function (error) {
          console.log("Error fetching data: ", error);
          reject(error);
        },
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showLunchModal(restaurant) {
    const name = restaurant.name || "Restaurant";
    const address = restaurant.address || "";
    const category = restaurant.category || "";
    $("#lunchPickTitle").text(name);
    $("#lunchPickName").text(name);
    $("#lunchPickAddress").text(address || "No address saved");
    $("#lunchPickCategory").text(category ? "Category: " + category : "");

    const map = $("#lunchPickMap");
    map.empty();
    if (address) {
      const query = encodeURIComponent(name + " " + address);
      map.append(
        `<iframe title="Map preview for ${escapeHtml(name)}" src="https://maps.google.com/maps?q=${query}&z=16&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
      );
    } else {
      map.append("<p class='mb-0'>No address available for a map preview.</p>");
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById("lunchPickModal")).show();
  }

  function chooseRestaurant(restaurantId) {
    const apiEndpoint = ENDPOINT + "restaurants/chooseVisit";

    $.ajax({
      url: `${apiEndpoint}/${restaurantId}`,
      method: "POST",
      success: function () {
        getRestaurantHistoryData(1);
      },
      error: function (error) {
        console.log("Error chooseVisit restaurant: ", error);
      },
    });
  }

  $("#resetFilter").on("click", async function () {
    clearFilter();
    await getRandomRestaurantData(1);
    await fetchCatImages();
  });

  async function init() {
    await getRestaurantHistoryData(1);
    const saved = readSnapshot();
    if (
      Array.isArray(saved.restaurants) &&
      saved.restaurants.length > 0 &&
      Array.isArray(saved.catUrls) &&
      saved.catUrls.length > 0
    ) {
      restaurantData = saved.restaurants;
      matchedTotal = saved.total;
      renderCards(restaurantData, saved.catUrls);
      toggleRestaurantResults(matchedTotal);
    } else {
      clearFilter();
      await getRandomRestaurantData(1);
      await fetchCatImages();
    }
    updateRefreshButton();
    setInterval(updateRefreshButton, 1000);
  }

  init();

  function toggleRestaurantResults(total) {
    const restaurantTotalElement = document.getElementById("restaurantTotal");
    const shown = total > 10 ? 10 : total;
    restaurantTotalElement.innerHTML = `Showing ${shown} matched random Restaurant `;
  }

  function formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      weekday: "long",
    };

    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", options);
    return formattedDate;
  }

  function clearFilter() {
    $("#filter_name").val("");
    $("#filter_address").val("");
    $("#filter_category").val("");
  }
});
