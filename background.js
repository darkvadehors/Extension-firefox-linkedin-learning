/** @format */

const linkedinLearningVideoDownloader = async () => {
	// receive the array from script.js
	browser.runtime.onMessage.addListener((requestCs) => {
		console.info('Nbr of Video :>> ', requestCs.courses_url.length);

		if (!requestCs.courses_url) {
			return;
		} //<= End of if

		// get the lenght of the array courses_url

		let coursesUrl = requestCs.courses_url;
		browser.windows.getCurrent().then(
			(window) => {
				// Open tabs only in the window the extension was started i n!
				getVideoUrlloopWithPromises(window.id, coursesUrl);
			},
			(error) => {
				console.error(`ERROR: Could not get window id: ${error};`);
			},
		);
	});
};

const getVideoUrlloopWithPromises = async (hostWindowId, coursesUrl) => {
	// custom Variable
	let arrayLength = coursesUrl.length;
	let url = [];
	let i = 0;
	let tabId;

	// using `while` loop
	while (i < arrayLength) {
		badge(i + 1);
		// 1st promise
		await new Promise((resolve) => {
			browser.tabs.create(
				{ url: coursesUrl[i], windowId: hostWindowId, active: true },
				async (tab) => {
					tabId = tab.id;
					resolve(1);
				},
			);
		});

		// 2th promise will resolve after the 1st promise
		await new Promise((resolve) => {
			browser.tabs
				.executeScript(tabId, { file: 'tabs.js' })
				.then(async (results) => {
					if (results) {
						url.push(results);
						browser.tabs.remove(tabId);
					}
					// return results;
					resolve(2);
				});
		});

		i++;
	}
	// download Video
	downloadVideo(url);
};

/**
 * Function donwload Video
 * @description Function for download video from the array Url
 * @var url: array with all Url video
 */

const downloadVideo = (videoData) => {
	let arrayLenght = videoData.length;

	// add O before if inf 10
	if (arrayLenght <= 9) {
		arrayLenght = '0' + arrayLenght;
	}

	videoData.forEach(async (element, index) => {
		let name = await removeSpecialChars(element[0].videoTitle);
		let formation = await removeSpecialChars(element[0].formationTilte);
		let videoNbr = index + 1;

		// add O before if inf 10
		if (videoNbr <= 9) {
			videoNbr = '0' + videoNbr;
		}

		const videoFileName =
			'Linkedin-Learning/' +
			formation +
			'/' +
			videoNbr +
			'_' +
			arrayLenght +
			'-' +
			// cleaning title
			name +
			'.mp4';

		// Start download
		browser.downloads.download({
			url: element[0].videoUrl,
			filename: videoFileName,
			conflictAction: 'uniquify',
			saveAs: false,
		});
		badge();
	});
};
/*
                while (tabCount < MAX_TABS && bookmarks.length > 0) {
                    loadBookmark();
                }


*/
/**
 * Promise badge
 * @description update the icon badge with the number
 * @var nbr: number to display
 */
const badge = (nbr = 0) => {
	// color in red the number on Icon
	// browser.browserAction.setBadgeBackgroundColor({ color: 'red' });
	browser.browserAction.setIcon({
		path: 'icons/icon-48-red.png',
	});

	// add the number of the course and the red color to the button
	if (nbr > 0) {
		browser.browserAction.setBadgeText({
			text: nbr.toString(),
		});
	} else {
		browser.browserAction.setBadgeText({ text: '' });
		browser.browserAction.setIcon({
			path: 'icons/icon-48.png',
		});
	}
	// resolve('badge OK');
};

/**
 * Function removeSpecialChar
 * @description cleaning sting
 * @var str: string to cleaning
 */
const removeSpecialChars = async (str) => {
	return str
		.replace(/[àâäÀÂªÆÁÄÃÅĀ]+/g, 'a') // Remplace tout les a
		.replace(/[êéèëÉÈÊËĘĖĒ]+/gi, 'e') // Remplace tout les e
		.replace(/[îìïÎÏÌÍĮĪ]+/gi, 'i') // Remplace tout les i
		.replace(/[öôÔŒºÖÒÓÕØŌ]+/gi, 'o') // Remplace tout les o
		.replace(/[ÛÙÜÚŪûüùœ]+/gi, 'u') // Remplace tout les u
		.replace(/(?!\w|\s)./g, '') // supprimer tout caractère qui n'est pas un mot ou un espace. \w est équivalent à [A-Za-z0-9_]
		.replace(/\s+/g, ' ') //trouver toute apparence de 1 ou plus des espaces et de la remplacer par un espace blanc simple
		.replace(/^(\s*)([\W\w]*)(\b\s*$)/g, '$2') //couper la chaîne à supprimer tous les espaces au début ou à la fin.
		.replace(/\s/g, '_'); // remplace tout les espace par un underscore
};
/**
 * Start Script
 */
linkedinLearningVideoDownloader();

/**
 * Wait click
 */

function onClick() {
	badge();
	chrome.tabs.executeScript({ file: 'script.js' });
}

browser.browserAction.onClicked.addListener(onClick);
