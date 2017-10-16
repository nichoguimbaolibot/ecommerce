var Product = require("../models/product");
var Comment = require("../models/comment");

var middlewareObj= {};

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, comment){
			if(err){
				console.log(err);
			} else{
				if(comment.author.id.equals(req.user._id) || req.user.isAdmin || req.user.superUser){
					return next();
				} else{
					
				}
			}
		});
	}
};

module.exports = middlewareObj;