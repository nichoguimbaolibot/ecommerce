$(function(){




	$("#search").keyup(function(){
		var search_term = $(this).val();

		$.ajax({
			method: "POST",
			url: "/api/search",
			data: {
				search_term
			},
			dataType: "json",
			success: function(json){
				var data = json.hits.hits.map(function(hit){
			return hit;
			});
				$("#searchResults").empty();
				for(var i = 0; i < data.length; i++){
					var html = "";
					html += '<div class="col-md-4">';
					html+= '<a style="text-decoration:none;" href="/product/' +  data[i]._id  + '">';
					html+= '<div class="thumbnail">';
					html+= '<img src="http://localhost/nodejs/ecommerce/routes/images/' +  data[i]._source.image  + '">';
					html+= '<div class="caption">';
					html+= '<div class="text-center" id="pink-hover">';
					html+= '<h3>' +  data[i]._source.name  + '</h3>';
					html+= '<p>' +  data[i]._type  + '</p>';
					html+= '<p>Php ' +  data[i]._source.price.toFixed(2)  + '</p>';
					html+= '</div>';
					html += '<div class="text-center">';
					html += '<form action="/product/' +  data[i]._id  + '" method="POST">';
					html += '<input type="hidden" name="product_id" value="' +  data[i]._id  + '">';
					html += '<input type="hidden" name="name" value="' +  data[i]._source.name  + '">';
					html += '<input type="hidden" name="priceValue" value="' +  data[i]._source.price  + '">';
					html += '<input type="hidden" name="quantity" value="1">';
					html += '<button id="pink" class="btn"><span class="glyphicon glyphicon-shopping-cart"> </span>ADD TO CART</button>';
					html+= '</form>';
					html+= '</div>';
					html+= '</div>';
					html+= '</div>';
					html+= '</a>';
					html+= '</div>';
					$("#searchResults").append(html);				
				}
			},
			error: function(err){
				console.log(err);
			}
		});
	});

	


});
Stripe.setPublishableKey('pk_test_Z5440ddW8B1ffHEcjsuUrQJC');


$(document).on("click", "#plus", function(e){
	e.preventDefault();
	var priceValue = parseFloat($("#priceValue").val());
	var quantity = parseInt($("#quantity").val());

	priceValue += parseFloat($("#priceHidden").val());
	quantity += 1;
	$("#quantity").val(quantity);
	$("#priceValue").val(priceValue.toFixed(2));
	$("#total").html(quantity);
});

$(document).on("click", "#minus", function(e){
	e.preventDefault();
	var priceValue = parseFloat($("#priceValue").val());
	var quantity = parseInt($("#quantity").val());
	if(quantity ==1){
		priceValue = $("#priceHidden").val();
		quantity = 1;
	} else{
	priceValue -= parseFloat($("#priceHidden").val());
	quantity -= 1;		
	}

	$("#quantity").val(quantity);
	$("#priceValue").val(priceValue.toFixed(2));
	$("#total").html(quantity);
});

var opts = {
  lines: 12, // The number of lines to draw
  length: 36, // The length of each line
  width: 13, // The line thickness
  radius: 25, // The radius of the inner circle
  scale: 1, // Scales overall size of the spinner
  corners: 1, // Corner roundness (0..1)
  color: '#edd9d9', // CSS color or array of colors
  fadeColor: 'transparent', // CSS color or array of colors
  opacity: 0.25, // Opacity of the lines
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  speed: 1, // Rounds per second
  trail: 60, // Afterglow percentage
  fps: 20, // Frames per second when using setTimeout() as a fallback in IE 9
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  className: 'spinner', // The CSS class to assign to the spinner
  top: '50%', // Top position relative to parent
  left: '50%', // Left position relative to parent
  shadow: 'none', // Box-shadow for the lines
  position: 'absolute' // Element positioning
};
function stripeResponseHandler(status, response) {

  // Grab the form:
  var $form = $('#payment-form');

  if (response.error) { // Problem!

    // Show the errors on the form
    $form.find('.payment-errors').text(response.error.message);
    $form.find('button').prop('disabled', false); // Re-enable submission

  } else { // Token was created!

    // Get the token ID:
    var token = response.id;

    // Insert the token into the form so it gets submitted to the server:
    $form.append($('<input type="hidden" name="stripeToken" />').val(token));
    var spinner = new Spinner(opts).spin();
    $('#loading').append(spinner.el);
    // Submit the form:
    $form.get(0).submit();

  }
}

$('#payment-form').submit(function(event){
	var $form = $(this);

	// Disable the submit button to prevent repeated clicks

	$form.find('button').prop('disabled', true);

	// Prevent the form from submitting with the default action

	Stripe.card.createToken($form, stripeResponseHandler)
});



