/** @format */

const linkedinLearningVideoDownloader = async () => {
	// receive the array from script.js
	browser.runtime.onMessage.addListener((requestCs) => {
		console.info('LL-VideoDl-Video in course :', requestCs.courses_url.length);

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
 * function badge
 * @description update the icon badge with the number
 * @var nbr: number to display
 */
const badge = (nbr = 0, total = 0, color = 'rgb(53, 167, 90)') => {
	// color in red the number on Icon
	// browser.browserAction.setBadgeBackgroundColor({ color: 'red' });
	browser.browserAction.setIcon({ path: 'icons/icon-48-red.png' });
	let text;
	// add the number of the course and the red color to the button
	if (nbr > 0) {
		if (total !== 0 && nbr <= 9) {
			text = nbr.toString() + '|' + total;
		} else {
			text = nbr.toString();
		}
		browser.browserAction.setBadgeTextColor({ color: 'white' });
		browser.browserAction.setBadgeBackgroundColor({ color: color });
		browser.browserAction.setBadgeText({ text: text });
	} else {
		browser.browserAction.setBadgeText({ text: '' });
		browser.browserAction.setIcon({
			path: 'icons/icon-48.png',
		});
	}
	// resolve('badge OK');
};

/**
 * fucntion Get Video Url Loop With promise
 */
const getVideoUrlloopWithPromises = async (hostWindowId, coursesUrl) => {
	let tabId;
	let videoDataObject = [];
	let i = 0;

	const promise1 = await new Promise(async (resolve) => {
		// using `while` loop
		while (i < coursesUrl.length) {
			badge(i + 1, coursesUrl.length);

			// 1st promise
			await new Promise((resolve) => {
				browser.tabs.create({ url: coursesUrl[i], windowId: hostWindowId, active: true }, async (tab) => {
					tabId = tab.id;
					resolve(1);
				});
			});

			// 2th promise will resolve after the 1st promise
			await new Promise((resolve) => {
				browser.webNavigation.onCompleted.addListener(logOnCompleted);

				/**
				 * new
				 */
				function logOnCompleted(details) {
					if (details.url === coursesUrl[i]) {
						browser.tabs
							.executeScript(tabId, { file: '/content_scripts/tabs.js' })
							.then(async (results) => {
								// console.debug(`Results video N°${i + 1}-${results[0].videoUrl}`);

								if (results[0] === 'Error' || results[0] === undefined || results[0] === null) {
									console.log('result erreur');
									browser.tabs.remove(tabId);
									console.debug(`Error in Open Tabs Id:${tabId}`);
									i--;
									badge();
								} else {
									// set index in results
									results[0].index = i + 1;
									videoDataObject.push(results);
									browser.tabs.remove(tabId);
								}

								// return results;
								browser.webNavigation.onCompleted.removeListener(logOnCompleted);
								resolve(1);
							})
							.catch(() => {
								browser.webNavigation.onCompleted.removeListener(logOnCompleted);
								badge();
							});
					}
				}
			});

			i++;
		}
		resolve(1);
	});

	const promise2 = await new Promise(async (resolve) => {
		// download Video
		await downloadManager(videoDataObject);
		resolve(2);
	});
};

/**
 * Function downloadManager
 * @description send to downloadVideo the good Url
 * @var videoDataObject
 */
const downloadManager = async (videoDataObject) => {
	let tabDownloaded = [];

	browser.downloads.onCreated.addListener(handleCreated);
	browser.downloads.onChanged.addListener(handleChanged);

	// mise en forme du nbr total de video
	let totalVideoToDownload = videoDataObject.length;

	/**
	 * Tableau 1 est une copy de VideoDataObject
	 */
	var tableau1 = [...videoDataObject.flat()];

	var tableau2 = [];

	for (let index = 0; index < 1; index++) {
		tableau2.push(tableau1.shift());
	}

	let i = 0;
	/**
	 * on boucle sur l'object si le nbr de video télécharge est inf au nbr de video à télécharger
	 * */
	while (i < tableau2.length) {
		badge(tableau1.length + 1, 0, 'red');
		downloadVideo(tableau2, totalVideoToDownload);
		tableau2.shift();
		i++;
	}

	//  surveille les dl creer
	function handleCreated(item) {
		// console.info(`dl n° ${item.id} creer`);
		// push every dl in new array
		tabDownloaded.push(item.id);
	}

	// surveille les changement de statuts des dl
	async function handleChanged(delta) {
		if (tabDownloaded.length >= 3) {
			erasing();
			tabDownloaded.pop();
		}
		if (delta.state && delta.state.current === 'complete') {
			if (tableau1.length !== 0) {
				tableau2 = [];
				tableau2.push(await tableau1.shift());
				badge(tableau1.length + 1 , 0, 'red');
				downloadVideo(tableau2, totalVideoToDownload);
			} else {
				browser.downloads.onChanged.removeListener(handleChanged);
				browser.downloads.onCreated.removeListener(handleCreated);
				badge();
			}
		}
	}
}; // end Download Manager

/**
 * Function donwload Video
 * @description Function for download video from the array Url
 * @var url: array with all Url video
 * @var totalVideoToDownload: optional, default 1
 */
const downloadVideo = (videoDataObject, totalVideoToDownload = '1') => {
	videoDataObject.forEach(async (element) => {
		let name = await removeSpecialChars(element.videoTitle);
		let formation = await removeSpecialChars(element.formationTilte);
		let indexVideo = await indexZero(element.index);
		let totalVideo = await indexZero(totalVideoToDownload);
		let url = element.videoUrl;

		// console.debug(`videoDataObject N°${indexVideo}  :>>`, url);

		const videoFileName =
			'Linkedin-Learning/' +
			formation +
			'/' +
			indexVideo +
			'_' +
			totalVideo +
			'-' +
			// cleaning title
			name +
			'.mp4';

		// Start download
		try {
			browser.downloads.download({
				url: url,
				filename: videoFileName,
				conflictAction: 'uniquify',
				saveAs: false,
			});
		} catch (error) {
			console.error(`Error videoDataObject Url ${name} - ${element.videoUrl}`);
		}
	});
};

const erasing = () => {
	browser.downloads.erase({
		limit: 1,
		orderBy: ['startTime'],
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
 * @returns str
 */
const indexZero = async (nbr) => {
	if (nbr < 10) {
		nbr = `0${nbr}`;
		return nbr;
	} else {
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
	chrome.tabs.executeScript({ file: '/content_scripts/script.js' });
}

browser.browserAction.onClicked.addListener(onClick);