/** @format */

'use strict';

/**
 * A supprimer ancien test
 */
// function onExecuted(result) {
// 	console.log(`We executed in all subframes`);
// 	return;
// }

// function onError(error) {
// 	console.log(`Error: ${error}`);
// }

// function getActiveTab() {
// 	let gettingActiveTab = browser.tabs.query({
// 		active: true,
// 		currentWindow: true,
// 	});
// 	gettingActiveTab.then((tabs) => {
// 		console.log('tabId', tabs[0].id);
// 	});
// }

(async () => {
	// Var for Video Url
	var url = [];

	// receive the array from script.js
	browser.runtime.onMessage.addListener((requestCs) => {
		// console.log('request', request);
		// console.log('typeofrequest', typeof request);

		if (requestCs.courses_url) {
			// get the lenght of the array courses_url
			// let length = requestCs.courses_url.length;
			let length = 1;
			var tabId;

			console.log("nombre d'onglet a ouvrir ", length);

			console.log('requestCs.courses_url', requestCs.courses_url);

			console.log(
				'#############################################################',
			);
			// create a new tab for each course
			// For ...of version
			for (const element of requestCs.courses_url) {
				//badge(length);
				// open each tabs

				/**
				 * Promise badge
				 * @description update the icon badge with the number
				 * @var length
				 */
				const badge = new Promise((resolve, reject) => {
					console.log('1 entree ================> badge');
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
					console.log('2 Sortie ================> badge');
					resolve(true);
				});

				/**
				 * Promise CreateTabs
				 * @description Create a new tab with  the url in the element loop
				 * @var element
				 */
				const createTabs = new Promise((resolve, reject) => {
					browser.tabs.create({ url: element, active: true }, (tab) => {
						console.log('3 entree ================> cresteTabs');
						tabId = tab.id;
						console.log('3.1 tabId', tabId);
						console.log('5 Sortie ================> cresteTabs');
						resolve(true);
					});
				});

				/**
				 * Promise ExcuteScript
				 * @description Launch JS in the new Tab
				 * @var element
				 * @var tab
				 * @return Video Url
				 */
				const ExcuteScript = new Promise((resolve, reject) => {
					browser.tabs
						.executeScript(tabId, { file: 'tabs.js' })
						.then((results) => {

							console.log('result ', results);
							// return results;
							console.log(
								'7 entree ================> ExcuteScript',
							);
						})
						.then(() => {
							// on ferme la tab precedement ouverte
							// browser.tabs.remove(tab.id);
							console.log(
								'8 Sortie ================> ExcuteScript',
							);
							resolve('tutu');
						})
						.catch((error) => {
							console.error('Failed: ' + error);
						});

					// console.log('Sortie cresteTabs');
				});

				/**
				 * Promise
				 * @description
				 */

				do {
					Promise.all([badge, createTabs, ExcuteScript]).then(
						(values) => {
							console.log(
								' 9 ================> Fin Promisa.all',
								values,
							);
							const result = true;
						},
					);
				} while (result == true);

				// const video = cresteTabs(element);

				// url.push(video);

				/**
				 * Fonction Future
				 */
				// on ferme la tab precedement ouverte
				// browser.tabs.remove(tab.id);

				/**
				 * Fonction Future
				 */
				// on telecharge la video grace a l'url récupéré
				// browser.downloads.download({
				// 	url: request.video_url,
				// 	filename: 'video.mp4',
				// });

				// decrement de 1 the length
				length--;
			} //<= End of For
		} //<= End of if

		// cleaning icon
		browser.browserAction.setIcon({ path: 'icons/icon-48.png' });
		browser.browserAction.setBadgeText({ text: '' });
	});
})();

/**
 * Start the script
 */

function onClick() {
	chrome.tabs.executeScript({ file: 'script.js' });
}

browser.browserAction.onClicked.addListener(onClick);


function handleActivated(activeInfo) {
    console.log("Tab " + activeInfo.tabId +
                " was activated");
  }

  browser.tabs.onActivated.addListener(handleActivated);

