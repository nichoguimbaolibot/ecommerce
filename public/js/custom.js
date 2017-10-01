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
			},
			error: function(err){
				console.log(err);
			}
		});
	});
});