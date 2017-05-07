var getCurrentBuild = function(callback){
	$.getJSON('https://api.github.com/repos/sameid/shootyroads/git/refs/heads/master', function(data){
  		// console.log(data.object.url);
  		$.getJSON(data.object.url, function(_data){
  			var build = {
  				date: _data.committer.date,
  				sha: _data.sha,
  				message: _data.message
  			}
  			$.getJSON("https://api.github.com/repos/sameid/shootyroads/compare/ca2ad1e73a04a3228e56c5419d7ab7a6fe1e48bc..." + build.sha, function(__data){

  				var ver = __data.total_commits + 1;
  				build.version = ver;
  				callback(build);
			});
  		});
	})
}
