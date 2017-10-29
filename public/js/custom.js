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
					html+= '<img src="' +  data[i]._source.image  + '">';
					html+= '<div class="caption">';
					html+= '<div class="text-center" id="pink-hover">';
					html+= '<h3>' +  data[i]._source.name  + '</h3>';
					html+= '<p>' +  data[i]._type  + '</p>';
					html+= '<p>$' +  data[i]._source.price  + '</p>';
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