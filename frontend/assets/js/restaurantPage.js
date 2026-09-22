$(document).ready(function () {
  const ENDPOINT = window.API_BASE || "http://localhost:3000/v1/";

  let totalPages = 1;
  let fullPageBodyHeight = 0;
  let openRestaurantId = null;
  const restaurantsById = {};
  var deleteRestaurantId = 1;

  // Function to retrieve restaurant data from the API
  function getRestaurantData(page) {
    if (page === 1) {
      fullPageBodyHeight = 0;
    }
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
        console.log("data : ", data);
        const scroller = document.querySelector(".d-flex.flex-column.h-100");
        const scrollTop = scroller ? scroller.scrollTop : 0;
        // Populate the table with restaurant data
        const restaurantList = $("#restaurant-list");
        restaurantList.empty();
        data.totalResults === 0
          ? toggleNoResultsRow(true)
          : toggleNoResultsRow(false);
        totalPages = data.totalPages;
        Object.keys(restaurantsById).forEach(function (id) {
          delete restaurantsById[id];
        });
        data.results.forEach(function (restaurant) {
          restaurantsById[restaurant.id] = restaurant;
          restaurantList.append(
            `<tr data-id="${escapeHtml(restaurant.id)}">
              <td>${escapeHtml(restaurant.name)}</td>
              <td>${escapeHtml(restaurant.address)}</td>
              <td>${escapeHtml(restaurant.category)}</td>
              <td>
                <div class="d-flex flex-nowrap gap-2">
                  <button type="button" class="btn btn-secondary btn-sm btn-restaurant-info">Info</button>
                  <button type="button" class="btn btn-danger btn-sm btn-delete" data-id="${escapeHtml(restaurant.id)}">
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </div>
              </td>
            </tr>`
          );
        });
        holdListHeight(data.results.length, data.limit || 10);
        createPagination(totalPages, data.page);
        if (scroller) {
          scroller.scrollTop = scrollTop;
          requestAnimationFrame(function () {
            scroller.scrollTop = scrollTop;
          });
        }
      },
      error: function (error) {
        console.log("Error fetching data: ", error);
      },
    });
  }
  $("#restaurant-list").on("click", ".btn-delete", function (event) {
    event.stopPropagation();
    deleteRestaurantId = $(this).data("id");
    $("#confirmDeleteModal").show();
  });

  $("#restaurant-list").on("click", "tr", function (event) {
    if ($(event.target).closest(".btn-delete").length) {
      return;
    }
    const restaurant = restaurantsById[$(this).attr("data-id")];
    if (!restaurant) {
      return;
    }
    toggleRestaurantInfo(restaurant);
  });

  $("#restaurantInfoModal").on("hidden.bs.modal", function () {
    openRestaurantId = null;
    $("#restaurantInfoMap").empty();
  });

  $(".cancelDeleteBtn").on("click", function () {
    $("#confirmDeleteModal").hide();
  });

  $("#confirmDeleteBtn").on("click", function () {
    deleteRestaurant(deleteRestaurantId);
    $("#confirmDeleteModal").hide();
  });

  // Function to delete a restaurant (you need to implement this)
  function deleteRestaurant(restaurantId) {
    const apiEndpoint = ENDPOINT + "restaurants";

    // Make an API request to delete the restaurant by its ID
    $.ajax({
      url: `${apiEndpoint}/${restaurantId}`,
      method: "DELETE",
      success: function () {
        $("#successNotification").fadeIn();
        $("#successNotification p").text("Restaurant deleted successfully.");

        setTimeout(function () {
          $("#successNotification").fadeOut();
        }, 3000);

        getRestaurantData(1);
      },
      error: function (error) {
        console.log("Error deleting restaurant: ", error);
        $("#errorNotification").fadeIn();
        $("#errorNotification p").text(error.responseJSON.message);
        setTimeout(function () {
          $("#errorNotification").fadeOut();
        }, 5000);
      },
    });
  }

  // Function to create pagination links
  function createPagination(totalPages, currentPage) {
    const paginations = $(".restaurant-pagination");
    paginations.empty();
    for (let i = 1; i <= totalPages; i++) {
      const liClass = i === currentPage ? "page-item active" : "page-item";
      paginations.append(
        `<li class="${liClass}" data-page="${i}">
          <button type="button" class="page-link">${i}</button>
        </li>`
      );
    }

    paginations.find(".page-link").click(function () {
      const page = $(this).parent().data("page");
      getRestaurantData(page);
    });
  }

  function holdListHeight(rowCount, pageSize) {
    const spacer = $("#restaurant-list-spacer");
    const listHeight = $("#restaurant-list").outerHeight() || 0;
    if (rowCount >= pageSize) {
      fullPageBodyHeight = listHeight;
      spacer.height(0);
      return;
    }
    if (!fullPageBodyHeight || rowCount === 0) {
      spacer.height(0);
      return;
    }
    spacer.height(Math.max(0, fullPageBodyHeight - listHeight));
  }

  // Initial call to retrieve the first page of data
  clearFilter();
  getRestaurantData(1);

  // // Initialize Bootstrap popovers
  // $('[data-bs-toggle="popover"]').popover();

  // const restaurantList = $("#restaurant-list");
  // // Handle delete button click
  // restaurantList.on("click", ".btn-delete", function () {
  //   const restaurantId = $(this).data("id");
  //   const confirmDelete = confirm(
  //     "Are you sure you want to delete this restaurant?"
  //   );

  //   if (confirmDelete) {
  //     // Handle the delete action here (e.g., make an API request to delete the restaurant)
  //     // After successful deletion, remove the corresponding row from the table
  //     $(this).closest("tr").remove();
  //   }
  // });

  $("#add-restaurant").click(function (event) {
    console.log("add click");
    event.preventDefault(); // Prevent the default form submission
    if (!validateForm()) {
      return null;
    }
    createRestaurant();
  });

  $("#search").click(function (event) {
    getRestaurantData(1);
  });
  $("#resetFilter").on("click", function () {
    clearFilter();
    getRestaurantData(1);
  });

  // Function to validate the form fields
  function validateForm() {
    const form = document.getElementById("restaurant-form");
    if (!form.checkValidity()) {
      // The form is not valid, add the Bootstrap classes for validation
      $(form).addClass("was-validated");
      // Prevent form submission if it's not valid
      return false;
    }

    // Form is valid
    return true;
  }

  // Function to create a new restaurant (make an API request)
  function createRestaurant() {
    const apiEndpoint = ENDPOINT + "restaurants";

    const newRestaurant = {
      name: $("#name").val(),
      address: $("#address").val(),
      category: $("#category").val(),
      porkFree: $("#pork-free").prop("checked"),
      walkInOnly: $("#walk-in-only").prop("checked"),
    };

    // Make an API request to create the restaurant
    $.ajax({
      url: apiEndpoint,
      method: "POST",
      data: JSON.stringify(newRestaurant),
      contentType: "application/json",
      success: function () {
        $("#successNotification").fadeIn();
        $("#successNotification p").text("New restaurant created.");

        setTimeout(function () {
          $("#successNotification").fadeOut();
        }, 3000);
        clearFormFields();
        $("#staticBackdrop").modal("hide");
        getRestaurantData(1);
      },
      error: function (error) {
        console.log("Error creating restaurant: ", error);
        $("#errorNotification").fadeIn();
        $("#errorNotification p").text(error.responseJSON.message);
        setTimeout(function () {
          $("#errorNotification").fadeOut();
        }, 5000);
      },
    });
  }
  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toggleRestaurantInfo(restaurant) {
    const modalElement = document.getElementById("restaurantInfoModal");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    if (openRestaurantId === restaurant.id && modalElement.classList.contains("show")) {
      modal.hide();
      return;
    }

    const name = restaurant.name || "Restaurant";
    const address = restaurant.address || "";
    const category = restaurant.category || "";
    $("#restaurantInfoTitle").text(name);
    $("#restaurantInfoName").text(name);
    $("#restaurantInfoAddress").text(address || "No address saved");
    $("#restaurantInfoCategory").text(category ? "Category: " + category : "");

    const map = $("#restaurantInfoMap");
    map.empty();
    if (address) {
      const query = encodeURIComponent(name + " " + address);
      map.append(
        `<iframe title="Map preview for ${escapeHtml(name)}" src="https://maps.google.com/maps?q=${query}&z=16&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
      );
    } else {
      map.append("<p class='mb-0'>No address available for a map preview.</p>");
    }

    openRestaurantId = restaurant.id;
    if (!modalElement.classList.contains("show")) {
      modal.show();
    }
  }

  function toggleNoResultsRow(show) {
    if (show) {
      const restaurantList = $("#restaurant-list");
      restaurantList.append(
        `<tr id="noResultsRow">
            <td colspan="4">
                <p class="alert alert-danger">No matching results found.</p>
            </td>
        </tr>
        `
      );
    }
  }
  // Function to clear the form fields
  function clearFormFields() {
    $("#name").val("");
    $("#address").val("");
    $("#category").val("");
    $("#pork-free").prop("checked", false);
    $("#walk-in-only").prop("checked", false);
  }
  function clearFilter() {
    $("#filter_name").val("");
    $("#filter_address").val("");
    $("#filter_category").val("");
  }
});
