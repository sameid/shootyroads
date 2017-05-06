var getCurrentBuild = function(callback){
	$.getJSON('https://api.github.com/repos/sameid/closecall-tilt/git/refs/heads/gh-pages', function(data){
  		// console.log(data.object.url);
  		$.getJSON(data.object.url, function(_data){
  			var build = {
  				date: _data.committer.date,
  				sha: _data.sha,
  				message: _data.message
  			}
  			$.getJSON("https://api.github.com/repos/sameid/closecall-tilt/compare/3008595c97686c63216afe6bd0eca6d27a72d128..." + build.sha, function(__data){

  				var ver = __data.total_commits + 1;
  				build.version = ver;
  				callback(build);
			});
  		});
	})
}

var getOS = function() {
  	var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  	if( userAgent.match( /iPad/i ) || userAgent.match( /iPhone/i ) || userAgent.match( /iPod/i ) )
  	{
    	return 'iOS';
  	}
  	else if( userAgent.match( /Android/i ) )
  	{
    	return 'Android';
  	}
  	else
  	{
    	return 'unknown';
  	}
}

