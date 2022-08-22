/** @format */

'use strict';

function onExecuted(result) {
	console.log(`We executed in all subframes`);
	return;
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function badge(length) {
	// color in red the number on Icon
	browser.browserAction.setBadgeBackgroundColor({ color: 'red' });

	// add the number of the course and the red color to the button
	if (length > 0) {
		browser.browserAction.setBadgeText({ text: length.toString() });
	} else {
		browser.browserAction.setBadgeText({ text: '' });
	}
}

function cresteTabs(element) {
	browser.tabs.create({ url: element }, (tab) => {
		console.log('tab', tab.id);

		console.log('entree cresteTabs');

		browser.tabs
			.executeScript(tab.id, { file: 'tabs.js' })
			.then(async (results) => {
				console.log('result ', results);
				return results;
			})
			.then(() => {
				// on ferme la tab precedement ouverte
				browser.tabs.remove(tab.id);
			})
			.catch((error) => {
				// This could happen if the extension is not allowed to run code in
				// the page, for example if the tab is a privileged page.
				console.error('Failed to copy text: ' + error);
			}); // execute the script in the new tab with tab.id

		console.log('Sortie cresteTabs');
	});
}

(async () => {
	let url = [];

	// receive the array from script.js
	browser.runtime.onMessage.addListener((requestCs) => {
		// console.log('request', request);
		// console.log('typeofrequest', typeof request);

		if (requestCs.courses_url) {
			// get the lenght of the array courses_url
			let length = requestCs.courses_url.length;
			console.log("nombre d'onglet a ouvrir ", length);

			console.log('requestCs.courses_url', requestCs.courses_url);

			// create a new tab for each course
			// For ...of version
			for (const element of requestCs.courses_url) {
				badge(length);
				// open each tabs

				new Promise((resolve, reject) => {
					console.log('Initial');
					resolve();
				})
					.then(() => {
						cresteTabs(element);
					})
					.then(() => {
						url.push(url);
					})
					.catch(() => {
						console.error('Do that');
					});

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
				length--;
			}

			// decrement de 1 the length
		}
	});
})();

/**
 * Start the script
 */

function onClick() {
	chrome.tabs.executeScript({ file: 'script.js' });
}

browser.browserAction.onClicked.addListener(onClick);
