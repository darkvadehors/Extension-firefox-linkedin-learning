/** @format */

// TODO check if page in learning and change color icon
// TODO installation page

const linkedinLearningVideoDownloader = async () => {
	// receive the array from script.js
	browser.runtime.onMessage.addListener(async (requestCs) => {
		// console.info('LL-VideoDl-Video in course :', requestCs.courses_url.length);

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
 * @var total optional, default 0
 * @var color Optional, default Green
 */
const badge = (nbr = 0, total = 0, color = 'rgb(53, 167, 90)') => {
	// color in red the number on Icon
	// browser.browserAction.setBadgeBackgroundColor({ color: 'red' });
	browser.browserAction.setIcon({ path: '/img/icons/icon-red.svg' });
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
			path: '/img/icons/icon-green.svg',
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
			// recupère les info de l'onglet
			let gettingActiveTab = await browser.tabs.query({ active: true, currentWindow: true });

			// regle le nouvelle onglet + 1
			let tabIndex = (await gettingActiveTab[0].index) + 1;

			// affiche le nômbre de videos
			badge(i + 1, coursesUrl.length);

			// 1st promise
			await new Promise((resolve) => {
				browser.tabs.create(
					{ url: coursesUrl[i], windowId: hostWindowId, index: tabIndex, active: true },
					async (tab) => {
						tabId = tab.id;
						resolve(1);
					},
				);
			});

			// 2th promise will resolve after the 1st promise
			await new Promise((resolve) => {
				browser.webNavigation.onCompleted.addListener(logOnCompleted);

				/**
				 * new
				 */
				function logOnCompleted(details) {
					if (details.url === coursesUrl[i]) {
						const cound = setInterval(() => {
							//  lance le compteur avec le temps maximum d'un onglet
							// si pas annuler avant la fin c'est qu'il y a une erreur donc badge 0
							clearInterval(cound);
							badge();
						}, 40000);

						browser.tabs
							.executeScript(tabId, { file: '/content_scripts/tabs.js' })
							.then(async (results) => {
								// console.debug(`Results video N°${i + 1}-${results[0].videoUrl}`);

								if (results[0] === 'Error' || results[0] === undefined || results[0] === null) {
									browser.tabs.remove(tabId);
									console.debug(`Error in Open Tabs Id:${tabId}`);
									i--;
									badge();
									clearInterval(cound);
								} else {
									// set index in results
									results[0].index = i + 1;
									results[0].pageUrl = coursesUrl[i];
									videoDataObject.push(results[0]);
									browser.tabs.remove(tabId);
									clearInterval(cound);
								}

								// return results;
								browser.webNavigation.onCompleted.removeListener(logOnCompleted);
								resolve(1);
							}) // end then
							.catch(() => {
								browser.webNavigation.onCompleted.removeListener(logOnCompleted);
								badge();
							});
					} // end if
				} // end fx logOnCompleted
			}); // end Promise

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
	browser.downloads.onCreated.addListener(handleCreated);
	browser.downloads.onChanged.addListener(handleChanged);

	// Liste en cours de DL
	let tabDownloading = [];

	// mise en forme du nbr total de video
	let totalVideoToDownload = videoDataObject.length;

	// Tableau 1 est une copy de VideoDataObject
	var tableau1 = [...videoDataObject.flat()];

	// Tableau est la file d'attente a dl
	var tableau2 = [];

	for (let index = 0; index < 1; index++) {
		tableau2.push(tableau1.shift());
	}

	/**
	 * on boucle sur l'object si le nbr de video télécharge est inf au nbr de video à télécharger
	 * */
	let i = 0;
	while (i < tableau2.length) {
		badge(tableau1.length + 1, 0, 'red');
		downloadVideo(tableau2, totalVideoToDownload);
		tableau2.shift();
		i++;
	}

	//  surveille les dl creer
	function handleCreated(item) {
		// console.info(`dl n° ${item.id} creer`);
		// push every dl in the tabDownloading array
		tabDownloading.push(item.id);
	}

	// surveille les changement de statuts des dl
	async function handleChanged(delta) {
		//  if delta.id is in array tabDownloading remove on and add a new DL
		if (tabDownloading.includes(delta.id)) {
			if (delta.state && delta.state.current === 'complete') {
				if (tableau1.length !== 0) {
					tableau2 = [];
					tableau2.push(await tableau1.shift());
					badge(tableau1.length + 1, 0, 'red');

					downloadVideo(tableau2, totalVideoToDownload);
					erasingDownloadingList();
				} else {
					finish();
				}
			} else if (delta.state && delta.state.current === 'interrupted') {
				finish();
			}
		}
	}

	const finish = () => {
		browser.downloads.onChanged.removeListener(handleChanged);
		browser.downloads.onCreated.removeListener(handleCreated);
		badge();
	};
}; // end Download Manager

/**
 * Function donwload Video
 * @description Function for download video from the array Url
 * @var downloadTable: array with all Url video: [{index: number, pageUrl: string, formationTitle: string,videoTitle: string,videoTastModified:string,videoUrl:string}]
 * @var totalVideoToDownload: optional, default 1
 */
const downloadVideo = (downloadTable, totalVideoToDownload = '1') => {
	downloadTable.forEach(async (element) => {
		let name = await removeSpecialChars(element.videoTitle);
		let formation = await removeSpecialChars(element.formationTitle);
		let indexVideo = await indexZero(element.index);
		let totalVideo = await indexZero(totalVideoToDownload);
		let url = element.videoUrl;
		let extention = '.mp4';

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
			extention;

		// Start download
		try {
			browser.downloads.download({
				url: url,
				filename: videoFileName,
				conflictAction: 'uniquify',
				saveAs: false,
			});
		} catch (error) {
			badge();
			console.error(`Error videoDataObject Url ${name} - ${element.videoUrl}`);
		}
	});
};

/**
 * ErasingDownloadingList
 * @description clean the browser download Manager
 */
const erasingDownloadingList = () => {
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
