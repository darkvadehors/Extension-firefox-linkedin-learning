/** @format */
'use strict';
(async () => {
	let timer = Math.floor(Math.random() * (14000 - 3000) + 3000);
	let minuter = parseInt((timer - 1000) / 1000);

	var videoData;

	await new Promise(async (resolve) => {
		console.log('dans tab');
		// document title
		// document.title = 'Do not touch !';
		setTimeout(() => {
			console.log('dans tab dans settime');
			// get the url of the video course
			const videoObject = document.querySelectorAll('video.vjs-tech');
			const formationTitle = document.querySelectorAll('div.classroom-nav__details > h1');
            timerBeforeClose();
			// declare videoData Object
			videoData = {
				formationTilte: formationTitle[0].innerText,
				videoTitle: videoObject[0].ownerDocument.title,
				videoTastModified: videoObject[0].ownerDocument.lastModified,
				videoUrl: videoObject[0].src,
			};

			// send array to background.js
			setTimeout(() => {
				resolve(timerBeforeClose());
			}, timer);
		}, 1000); // change the setTimeout whith random value
	});

	function timerBeforeClose() {
		setInterval(async () => {
			document.title = 'Close in ' + (minuter + 1) + ' sec.';
			minuter--;
		}, 1000);
	}

	return videoData;
})();


