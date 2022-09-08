/** @format */
'use strict';
(async () => {

	let timer = Math.floor(Math.random() * (7000 - 2000) + 2000);
	let minuter = parseInt(timer / 1000);

	// countdown before closing
	setInterval(async () => {
		document.title = 'Close in ' + minuter + ' sec.';
		minuter--;
	}, 1000);
	var videoData;

	await new Promise(async (resolve) => {
		// document title
		document.title = 'Do not touch !';
		setTimeout(() => {
			// get the url of the video course
			const videoObject = document.querySelectorAll('video.vjs-tech');
			const formationTitle = document.querySelectorAll(
				'div.classroom-nav__details > h1',
			);

			// declare videoData Object
			videoData = {
				formationTilte: formationTitle[0].innerText,
				videoTitle: videoObject[0].ownerDocument.title,
				videoTastModified: videoObject[0].ownerDocument.lastModified,
				videoUrl: videoObject[0].src,
			};

			// send array to background.js
			resolve(1);
		}, timer); // change the setTimeout  whith random value
	});

	return videoData;
})();
