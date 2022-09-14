/** @format */

const linkedinLearningVideoDownloader = async () => {
	// receive the array from script.js
	browser.runtime.onMessage.addListener((requestCs) => {
		console.info('Nbr of Video :>> ', requestCs.courses_url.length);

		if (!requestCs.courses_url) {
			return;
		}

		browser.windows.getCurrent().then(
			(window) => {
				// Open tabs only in the window the extension was started i n!
				getVideoUrlloopWithPromises(window.id, requestCs.courses_url);
			},
			(error) => {
				console.error(`ERROR: Could not get window id: ${error};`);
			},
		);
	});
};

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
 *
 */
const getVideoUrlloopWithPromises = async (hostWindowId, coursesUrl) => {
	let tabId;
	let videoDataObject = [];
	let i = 0;

	const promise1 = await new Promise(async (resolve) => {
		// using `while` loop
		while (i < coursesUrl.length) {
			badge(i + 1);
			// 1st promise
			await new Promise((resolve) => {
				browser.tabs.create({ url: coursesUrl[i], windowId: hostWindowId, active: true }, async (tab) => {
					tabId = tab.id;
					resolve(1);
				});
			});

			// 2th promise will resolve after the 1st promise
			await new Promise((resolve) => {
				browser.tabs.executeScript(tabId, { file: 'tabs.js' }).then(async (results) => {
					if (results) {
						// set index in results
						results[0].index = i + 1;
						videoDataObject.push(results);
						browser.tabs.remove(tabId);
					}
					// return results;
					resolve(2);
				});
			});

			i++;
		}
		resolve(1);
	});

	const promise2 = await new Promise(async (resolve) => {
		// download Video
		console.log('videoDataObject avant DLManager :>> ', videoDataObject);
		// videoDataObject = [
		// 	{
		// 		formationTilte: 'video 1',
		// 		videoTitle: 'Video 1',
		// 		videoTastModified: '09/13/2022 19:32:15',
		// 		videoUrl: 'https://cdimage.debian.org/debian-cd/current/amd64/iso-dvd/debian-11.5.0-amd64-DVD-1.iso',
		// 	},
		// 	{
		// 		formationTilte: 'video 2',
		// 		videoTitle: 'video 2',
		// 		videoTastModified: '09/13/2022 19:32:21',
		// 		videoUrl: 'https://cdimage.debian.org/debian-cd/current/amd64/iso-dvd/debian-11.5.0-amd64-DVD-1.iso',
		// 	},
		// 	{
		// 		formationTilte: 'video 3',
		// 		videoTitle: 'video 3',
		// 		videoTastModified: '09/13/2022 19:32:21',
		// 		videoUrl: 'https://cdimage.debian.org/debian-cd/current/amd64/iso-dvd/debian-11.5.0-amd64-DVD-1.iso',
		// 	},
		// 	{
		// 		formationTilte: 'video 4',
		// 		videoTitle: 'video 4',
		// 		videoTastModified: '09/13/2022 19:32:21',
		// 		videoUrl: 'https://cdimage.debian.org/debian-cd/current/amd64/iso-dvd/debian-11.5.0-amd64-DVD-1.iso',
		// 	},
		// 	{
		// 		formationTilte: 'video 5',
		// 		videoTitle: 'video 5',
		// 		videoTastModified: '09/13/2022 19:32:21',
		// 		videoUrl: 'https://cdimage.debian.org/debian-cd/current/amd64/iso-dvd/debian-11.5.0-amd64-DVD-1.iso',
		// 	},
		// ];
		await downloadManager(videoDataObject);
		resolve(2);
	});

	// Promise.all([promise1, promise2]).then(() => {
	// 	console.log('Fin...');
	// });
};

/**
 * Function downloadManager
 * @description send to downloadVideo the good Url
 * @var videoDataObject
 */
const downloadManager = async (videoDataObject) => {
	// set variable
	let tabDownload = [];

	browser.downloads.onCreated.addListener(handleCreated);
	browser.downloads.onChanged.addListener(handleChanged);

	// mise en forme du nbr total de video
	let totalVideoToDownload = videoDataObject.length;

	/**
	 * Tableau 1 est une copy de VideoDataObject
	 */
	var tableau1 = [...videoDataObject.flat()];
	console.log('videoDataObject tabelau 1 :>> ', tableau1);

	var tableau2 = [];

	for (let index = 0; index < 1; index++) {
		tableau2.push(tableau1.shift());
	}


	let i = 0;
	/**
	 * on boucle sur l'object si le nbr de video télécharge est inf au nbr de video à télécharger
	 * */
	while (i < tableau2.length) {
		badge(tableau1.length);
		downloadVideo(tableau2, totalVideoToDownload);

		i++;
	}

	//  surveille les dl creer
	function handleCreated(item) {
		console.info(`dl n° ${item.id} creer`);
	}

	// surveille les changement de statuts des dl
	function handleChanged(delta) {
		if (delta.state && delta.state.current === 'complete') {
			console.info(`Download has completed. => ${delta.id}`);
			if (tableau1.length !== 0) {
				tableau2 = [];
				tableau2.push(tableau1.shift());
				badge(tableau1.length);
				downloadVideo(tableau2, totalVideoToDownload);
			} else {
				console.info('Téléchargement Terminé');
				browser.downloads.onChanged.removeListener(handleChanged);
				browser.downloads.onCreated.removeListener(handleCreated);
			}
		}
	}
}; // end Download Manager

/**
 * Function donwload Video
 * @description Function for download video from the array Url
 * @var url: array with all Url video
 */
const downloadVideo = (videoDataObject, totalVideoToDownload) => {

	videoDataObject.forEach(async (element) => {
		let name = await removeSpecialChars(element.videoTitle);
		let formation = await removeSpecialChars(element.formationTilte);
		let indexVideo = await indexZero(element.index);
		totalVideoToDownload = await indexZero(totalVideoToDownload);


		const videoFileName =
			'Linkedin-Learning/' +
			formation +
			'/' +
			indexVideo +
			'_' +
			totalVideoToDownload +
			'-' +
			// cleaning title
			name +
			'.mp4';

		// Start download
		browser.downloads.download({
			url: element.videoUrl,
			filename: videoFileName,
			conflictAction: 'uniquify',
			saveAs: false,
		});
		badge();
	});
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
 * function indexZero
 * @description add zero before number if inf 10
 * @var number
 */
const indexZero = async (nbr) => {
	if (nbr <= 9) {
		nbr = '0' + nbr;
		return nbr;
	}
};

/**
 * Start Script
 */
linkedinLearningVideoDownloader();

/**
 * Wait click
 */

function onClick() {
	// reset Badget
	badge();

	// start script
	chrome.tabs.executeScript({ file: 'script.js' });
}

browser.browserAction.onClicked.addListener(onClick);
