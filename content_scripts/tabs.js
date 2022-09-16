/** @format */

(async () => {
	const min = 3000;
	const max = 15000;
	const timer = Math.floor(Math.random() * (max - min) + min);
	const minuter = parseInt((timer - 1000) / 1000);

	var videoData;

	await new Promise(async (resolve) => {
		setTimeout(() => {
			// get the url of the video course
			const videoObject = document.querySelectorAll('video.vjs-tech');
			const formationTitle = document.querySelectorAll('div.classroom-nav__details > h1');
			timerBeforeClose(minuter);
			// declare videoData Object
			videoData = {
				index: 0,
				formationTilte: formationTitle[0].innerText,
				videoTitle: videoObject[0].ownerDocument.title,
				videoTastModified: videoObject[0].ownerDocument.lastModified,
				videoUrl: videoObject[0].src,
			};
		}, 1000);

		function timerBeforeClose(minuter) {
			let min = minuter;
			const interval = setInterval(() => {
				if (min >= 0) {
					document.title = 'Close in ' + (min + 1) + " sec. don't touch !";
					min--;
				} else {
					clearInterval(interval);
					resolve(1);
				}
			}, 1000);
		}
	});
	return videoData;
})();
