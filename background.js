/** @format */

'use strict';

function onExecuted(result) {
	console.log(`We executed in all subframes`);
}

function onError(error) {
	console.log(`Error: ${error}`);
}

(async () => {
	// receive the array from script.js
	browser.runtime.onMessage.addListener((request) => {
		// console.log('request', request);
		// console.log('typeofrequest', typeof request);

		if (request.courses_url) {
			// get the lenght of the array courses_url
			let length = request.courses_url.length;
			console.log("nombre d'onglet a ouvrir ", length);

            // color in red the number on Icon
            browser.browserAction.setBadgeBackgroundColor({
                color: 'red',
            });
			// create a new tab for each course
			// For ...of version
			for (const element of request.courses_url) {
				// add the number of the course and the red color to the button
				browser.browserAction.setBadgeText({ text: length.toString() });

				// open each tabs
				browser.tabs.create({ url: element }, (tab) => {
					console.log('tab', tab.id);
					chrome.tabs.onUpdated.addListener(async (tabId, tab) => {
						console.log('avant await', tabId);

						var executingScript = await chrome.tabs
							.executeScript(tabId, { file: 'tabs.js' })
							.then((results) => {
								// The content script's last expression will be true if the function
								// has been defined. If this is not the case, then we need to run
								// clipboard-helper.js to define function copyToClipboard.
								if (!results || results[0] !== true) {
									return browser.tabs.executeScript(tab.id, {
										file: 'clipboard-helper.js',
									});
								}
							})
							.then(() => {
								return results;
							})
							.catch((error) => {
								// This could happen if the extension is not allowed to run code in
								// the page, for example if the tab is a privileged page.
								console.error('Failed to get url: ' + error);
							});

						executingScript.then(onExecuted, onError);
						console.log('after await');
					});
				});

				// on ferme la tab precedement ouverte
				browser.tabs.remove(tab.id);

				// on telecharge la video grace a l'url récupéré
				browser.downloads.download({
					url: request.video_url,
					filename: 'video.mp4',
				});

				/**
				 *  En attente de trouver une solution pour trouver la balise avec l'url de la video
				 * chrome.tabs.executeScript(tab.id, { file: 'download.js' });
				 */
			}

			// decrement de 1 the length
			length--;
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
