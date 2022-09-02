/** @format */

'use strict';

(async () => {
	// receive the array from script.js
	browser.runtime.onMessage.addListener((requestCs) => {
		console.log('request', requestCs);
		console.log('typeofrequest', typeof requestCs);

		if (!requestCs.courses_url) {
			return;
		} //<= End of if

		// Var for Video Url
		var url = [];
		let i = 0;

		// get the lenght of the array courses_url
		let length = requestCs.courses_url.length;
		let coursesUrl = requestCs.courses_url;
		// let length = 1;
		var tabId;

		console.log("nombre d'onglet a ouvrir ", length);

		console.log('requestCs.courses_url', coursesUrl);

		// console.log('###################################################');
		// create a new tab for each course
		// For ...of version
		while (i < length) {
			//badge(length);
			// open each tabs
            console.log("nombre d'onglet dans le while ", length, i);
			/**
			 * Promise badge
			 * @description update the icon badge with the number
			 * @var length
			 */
			(async ()=> await new Promise((resolve) => {
				console.log('1 entree ======> badge tour ', i);
				// color in red the number on Icon
				// browser.browserAction.setBadgeBackgroundColor({ color: 'red' });
				browser.browserAction.setIcon({
					path: 'icons/icon-48-red.png',
				});

				// add the number of the course and the red color to the button
				if (length > 0) {
					browser.browserAction.setBadgeText({
						text: length.toString(),
					});
				} else {
					browser.browserAction.setBadgeText({ text: '' });
				}
				console.log('2 Sortie ======> badge tour ', i);
				resolve(true);
			}))(); // fin promise

			/**
			 * Promise CreateTabs
			 * @description Create a new tab with
			 * the url in the coursesUrl
			 * @var coursesUrl
			 */
			(async ()=> await browser.tabs.create(
					{ url: coursesUrl[i], active: true },
					(tab) => {
						console.log('3 entree ======> cresteTabs tour ', i);
						tabId = tab.id;
						console.log('3.1 tabId', tabId);
						console.log('4 Sortie ======> cresteTabs tour ', i);
						resolve(true);
					},
				)
			)();

			/**
			 * Promise ExcuteScript
			 * @description Launch JS in the new Tab
			 * @var tab
			 * @return Video Url
			 */
			(async ()=> await browser.tabs
					.executeScript(tabId, { file: 'tabs.js' })
					.then(async (results) => {
						console.log('tabId ', tabId);
						// return results;
						url.push(results[0]);
                        return await results;
					})
					.then(() => {
						// on ferme la tab precedement ouverte
						//browser.tabs.remove(tabId);
                        console.log('result ', results);
						console.log('6 Sortie ======> ExcuteScript tour ', i,);

					})
					.catch((error) => {
						console.error('Failed: ' + error);
					})
			)();


			// decrement de 1 the length
            i++;

		} //<= End of while

		// cleaning icon
		browser.browserAction.setIcon({ path: 'icons/icon-48.png' });
		browser.browserAction.setBadgeText({ text: '' });
	});
})();

/**
 * Function donwload Video
 * @description Function for download video from the array Url
 * @var url -> array with all Url video
 */

function downloadVideo(videoData) {
	for (let index = 0; index < videoData.length; index++) {
		console.log('index => ', index);
		// build file name
		let videoFilename =
			index +
			1 +
			'_' +
			videoData.length +
			'-' +
			removeSpecialChars(videoData[index].videoTitle) +
			'.mp4';

		// Start download
		browser.downloads.download({
			url: videoData[0].videoUrl,
			filename: videoFilename,
			conflictAction: 'uniquify',
		});
	}
}

/**
 * Start the script
 */

function onClick() {
	chrome.tabs.executeScript({ file: 'script.js' });
}

browser.browserAction.onClicked.addListener(onClick);

function removeSpecialChars(str) {
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
}

function handleActivated(activeInfo) {
	console.log('Tab ' + activeInfo.tabId + ' was activated');
	// browser.tabs.remove(activeInfo.tabId);
	/**
	 * Fonction future a voir
	 */
	// if (!document.querySelectorAll('.entity-image').length < 0) {
	//     browser.browserAction.setIcon({ path: 'icons/icon-48-red.png' });
	// } else {
	//     browser.browserAction.setIcon({ path: 'icons/icon-48.png' });

	// }
}

browser.tabs.onActivated.addListener(handleActivated);
