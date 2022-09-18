/** @format */

(async () => {
    const minimum = 2000;
    const maximum = 8000;
	const delay = Math.floor(Math.random() * (maximum - minimum) + minimum);
	let countDown = parseInt((delay - 1000) / 1000);

	var videoData;

	await new Promise(async (resolve) => {
		setTimeout(() => {
			// get the url of the video course
			const videoObject = document.querySelectorAll('video.vjs-tech');
			const formationTitle = document.querySelectorAll('div.classroom-nav__details > h1');
			// timerBeforeClose();
			const cound = setInterval(() => {
				document.title = 'Close in ' + (countDown + 1) + " sec. don't touch !";
				if (countDown >= 0) {
					countDown--;
				} else {
					clearInterval(cound);
					resolve(1);
				}
			}, 1000);
			// declare videoData Object
			videoData = {
				index: 0,
				formationTilte: formationTitle[0].innerText,
				videoTitle: videoObject[0].ownerDocument.title,
				videoTastModified: videoObject[0].ownerDocument.lastModified,
				videoUrl: videoObject[0].src,
			};

		}, 1000);
	});

	return videoData;
})();
