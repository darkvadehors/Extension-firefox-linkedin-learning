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

	const promise2 = await new Promise((resolve) => {
		// download Video
		console.log('videoDataObject avant DLManager :>> ', videoDataObject);
		downloadManager(videoDataObject);
		resolve(2);
	});

	Promise.all([promise1, promise2]).then(() => {
		console.log('Fin...');
	});
};

/**
 * Function downloadManager
 * @description send to downloadVideo the good Url
 * @var videoDataObject
 */
const downloadManager = (videoDataObject) => {
	console.log('videoDataObject :>> ', videoDataObject);
	// set variable
	const maxDl = 1;
	downloading = 0;

	console.log('videoDataObject.length :>> ', videoDataObject.length);
	let totalVideoToDownload = videoDataObject.length;

	browser.downloads.onCreated.addListener(handleCreated);
	browser.downloads.onChanged.addListener(handleChanged);

	// mise en forme du nbr total de video
	if (videoDataObject.length <= 9) {
		totalVideoToDownload = '0' + videoDataObject.length;
	}
	console.log('totalVideoToDownload :>> ', totalVideoToDownload);
	// pour chaque video on verifie le nbr de dl en cours et on lance un nouveau si c'est bon
	videoDataObject.forEach((element) => {
		// Element est une video avec toutes ces informations
		console.log(`element :>> `, element);

		// Si element est plus petit que maxDl alors on charge une autre video sinon on attend
		let i = 0;
		while (i < totalVideoToDownload && this.downloading < maxDl) {
			console.log(` ------------ dl ${i} --------------- `);
			console.log('totalVideoDownload," - ", downloading :>> ', totalVideoToDownload, ' - ', this.downloading);

			downloadVideo(videoDataObject[0], i, totalVideoToDownload);

			videoDataObject.shift();

			badge(videoDataObject.length);
			i++;
		}
	});

	browser.downloads.onChanged.removeListener(handleChanged);
	browser.downloads.onCreated.removeListener(handleCreated);
};

//  surveille les dl creer
function handleCreated(item) {
	// affiche l'url des telechargememnnt
	/**
	 * donc mettre dans un tableau les telechargemenbt au
	 * fur et a mesure puis les enlever quand ils sont fini
	 */

	console.log(`dl n° ${item.id} creer`);
	this.downloading++;
}

// surveille les changement de statuts des dl
function handleChanged(delta) {
	if (delta.state && delta.state.current === 'complete') {
		console.log(`Download has completed. => ${delta.id}`);
		this.downloading--;
	}
}

/**
 * Function donwload Video
 * @description Function for download video from the array Url
 * @var url: array with all Url video
 */
/**
 * on a un array qui contient une liste d'object a telecharger
 * il faut un compteur de DL max
 * il faut prendre les element de la liste un par un  et les supprimers au fur et a mesure qu'on les prends
 * pour les telecharger si le max n'est pas atteind
 *
 */

const downloadVideo = (videoDataObject, index, totalVideoToDownload) => {
	this.downloading++;
	let indexVideo = index + 1;
	// add O before if inf 10
	// if (videoDataObject[0].id <= 9) {
	// 	videoDataObject[0].id = '0' + videoDataObject[0].id;
	// }

	console.log('download videoDataObject', videoDataObject);

	videoDataObject.forEach(async (element) => {
		console.log('element dans forEach :>> ', element);
		let name = await removeSpecialChars(element.videoTitle);
		let formation = await removeSpecialChars(element.formationTilte);

		// add O before if inf 10
		if (indexVideo <= 9) {
			indexVideo = '0' + indexVideo;
		}
		if (videoDataObject.lenght <= 9) {
			totalVideoToDownload = '0' + videoData;
		}

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
