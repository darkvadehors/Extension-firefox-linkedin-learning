/** @format */
'use strict';
(async () => {
	console.log('Entre dans tabs.js');

    var videoData;

	await new Promise((resolve, reject) => {
		setTimeout(() => {

			// get the url of the video course
			const videoObject = document.querySelectorAll('video.vjs-tech');
            const formationTitle = document.querySelectorAll("div.classroom-nav__details > h1")

			// declare videoData Object
			videoData = {
                formationTilte : formationTitle[0].innerText,
				videoTitle: videoObject[0].ownerDocument.title,
				videoTastModified: videoObject[0].ownerDocument.lastModified,
				videoUrl: videoObject[0].src,
			};

			// send array to background.js
			resolve(1);
		}, Math.floor(Math.random() * (7000 - 2000) + 2000)); // change the setTimeout  whith random value
	});

	return videoData;
})();
