$(document).ready(function () {
  // Define the API endpoint to fetch restaurant data
  const ENDPOINT = "http://localhost:3000/v1/";

  // You should determine the total number of pages and pass it to createPagination
  let totalPages = 1; // Replace with the actual total number of pages
  var deleteRestaurantId = 1;

  // Function to retrieve restaurant data from the API
  function getRestaurantData(page) {
    const apiEndpoint = ENDPOINT + "restaurants";

    $.ajax({
      url: apiEndpoint,
      method: "GET",
      data: { page: page },
      success: function (data) {
        console.log("data : ", data);
        // Populate the table with restaurant data
        const restaurantList = $("#restaurant-list");
        restaurantList.empty();
        totalPages = data.totalPages;
        data.results.forEach(function (restaurant) {
          const deleteButton = `
            <button class="btn btn-danger btn-delete" data-id="${restaurant.id}" data-bs-toggle="popover" data-bs-content="Are you sure?" data-bs-trigger="focus">
              <i class="bi bi-trash"></i> Delete
            </button>`;
          restaurantList.append(
            `<tr>
              <td>${restaurant.name}</td>
              <td>${restaurant.address}</td>
              <td>${restaurant.category}</td>
              <td>${deleteButton}</td>
            </tr>`
          );
        });
        $(".btn-delete").click(function () {
          deleteRestaurantId = $(this).data("id");
          // let restaurantId = $(this).data("id");
          // $("#confirmDeleteModal").attr("data-id", restaurantId);
          $("#confirmDeleteModal").show();
        });
        createPagination(totalPages, data.page);
      },
      error: function (error) {
        console.log("Error fetching data: ", error);
      },
    });
  }
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
    const pagination = $("#pagination");
    pagination.empty();
    for (let i = 1; i <= totalPages; i++) {
      const liClass = i === currentPage ? "page-item active" : "page-item";
      pagination.append(
        `<li class="${liClass}" data-page="${i}">
          <a class="page-link" href="#">${i}</a>
        </li>`
      );
    }

    // Add click event for pagination links
    pagination.find(".page-link").click(function (e) {
      e.preventDefault();
      const page = $(this).text();
      pagination.find(".page-item").removeClass("active");
      $(this).parent().addClass("active");
      getRestaurantData(page);
    });
  }

  // Initial call to retrieve the first page of data
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
  // Function to clear the form fields
  function clearFormFields() {
    $("#name").val("");
    $("#address").val("");
    $("#category").val("");
    $("#pork-free").prop("checked", false);
    $("#walk-in-only").prop("checked", false);
  }
});
