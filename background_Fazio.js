/** @format */

const linkedinLearningVideoDownloader = async () => {
	// set variable
	const maxDlAutorized = 2; // Nbr de video à télécharger en même temp
	let listOfUrlCourses; // Liste des Url retourné de script
	let nbrOfVideoToDownload; // nbr de video a télécharger
	let videoDataObject = []; // Object video Complet Titre, Url, date
	let indexVideo = 0; // Index pour le nom des video
	let downloading = 0; // telechargmenet en cours
	let downloaded = 0; // Video Téléchargé
    let hostWindowId;

	// receive the array from script.js
	browser.runtime.onMessage.addListener((requestCs) => {
		console.log('Nbr of Video :>> ', requestCs.courses_url);

		// Si il y a des url => Start
		if (requestCs.courses_url) {
			//  initialize les variables
			listOfUrlCourses = requestCs.courses_url;
			nbrOfVideoToDownload = requestCs.courses_url.length;

			// Récupère l'Id de la fenêtre courante
			browser.windows.getCurrent().then(
				(window) => {
					// Open tabs only in the window the extension was started i n!
                    hostWindowId = window.id;
					getVideoUrlloopWithPromises(window.id);
				},
				(error) => {
					console.error(`ERROR: Could not get window id: ${error};`);
				},
			);
		}
	});

	/**
	 * @description: get Video Url loop With Promises
	 * @var: hostWindowId : id de la fenetre actuel
	 */
	const getVideoUrlloopWithPromises = async () => {
		// custom Variable
		let tabId;

		await new Promise(async (resolve) => {
			// using `while` loop
			let i = 0;
			while (i < nbrOfVideoToDownload) {
				badge(i + 1);
				/**
				 * @description:  1st promise crée un nouveau Tab
				 * @return: tabID
				 */
				await new Promise((resolve) => {
					browser.tabs.create(
						{ url: listOfUrlCourses[i], windowId: hostWindowId, active: true },
						async (tab) => {
							tabId = tab.id;
							resolve(1);
						},
					);
				});

				/**
				 * ExecuteScript
				 * @descriton 2th promise will resolve after the 1st promise.
				 *            Exécute Tabs.js dans le nouvelle onglet et récupère les Data de la Video
				 * @return: videoDataObject
				 */
				await new Promise((resolve) => {
					browser.tabs.executeScript(tabId, { file: 'tabs.js' }).then(async (results) => {
						if (results) {
                            console.log('results :>> ', results);
							videoDataObject.push(...results);
							browser.tabs.remove(tabId);
						}
						// return results;
						resolve(2);
					});
				});

				i++;
			}
			// download Video
			resolve(console.log(' -------------------------- resolve 1 fini'));
		});

		await new Promise((resolve) => {
			resolve(console.log(' -------------------------- resolve 2 entrée', videoDataObject));
			downloadManager(videoDataObject);
			resolve(console.log(' -------------------------- resolve 2 fini'));
		});
	};

	/**
	 * Function downloadManager
	 * @description send to downloadVideo the good Video Data object
	 * @var videoDataObject
	 */
	const downloadManager = (videoDataObject2) => {

		browser.downloads.onCreated.addListener(handleCreated);
		browser.downloads.onChanged.addListener(handleChanged);

		// pour chaque video on verifie le nbr de dl en cours et on lance un nouveau si c'est bon
        // while (condition) {


        /**
         *
         * videoDataObject = [ => element
         {
				formationTilte: formationTitle[0].innerText,
				videoTitle: videoObject[0].ownerDocument.title,
				videoTastModified: videoObject[0].ownerDocument.lastModified,
				videoUrl: videoObject[0].src,
			},
        {
				formationTilte: formationTitle[0].innerText,
				videoTitle: videoObject[0].ownerDocument.title,
				videoTastModified: videoObject[0].ownerDocument.lastModified,
				videoUrl: videoObject[0].src,
			}]
         *
         *
         *
         */
            console.log('videoDataObject ======================= :>> ', videoDataObject2);
            let tableau1 = [...videoDataObject2];
            let tableau2 = tableau1.pop(maxDlAutorized);

            console.log('videoDataObject tabelau 1 :>> ', tableau1);
            console.log('videoDataObject tabelau 2 :>> ', tableau2);
            tableau2.forEach(async (element, index) => {

                await downloadVideo(element, index);
                tableau2.shift(1);
                if (tableau1.length > 0){
                    tableau2.push(tableau1.shift(1));
                }
            })




            // videoDataObject.forEach(async (element, index) => {
		// 	// Element est une video avec toutes ces informations
        //     console.log('videoDataObject :>> ', videoDataObject);
		// 	console.log('element 1 :>> ', element);

        //     // tant que le downloaded < nbrof video et
		// 	//while (downloaded < nbrOfVideoToDownload ) {

        //         console.log(' ------------ dl attente--------------- ', index);
        //         //  tant que downloading < maxdlAutorized
        //         if (downloading < maxDlAutorized ) {
        //             console.log(' ------------ dl --------------- ', index);
        //             downloading++;
        //             await downloadVideo(videoDataObject[0]);
        //             badge(nbrOfVideoToDownload - downloaded);
        //             downloaded++
        //         }


		// 	// }
		 //});

		browser.downloads.onChanged.removeListener(handleChanged);
		browser.downloads.onCreated.removeListener(handleCreated);
	};

	const downloadVideo = async (element,index) => {
		console.log('downloadVideo videoData :>> ', element);
		// add O before if inf 10
		if (index <= 9) {
			indexVideo = '0' + index;
		}
		// mise en forme du nbr total de video

		if (nbrOfVideoToDownload <= 9) {
			this.totalVideoToDownload = '0' + nbrOfVideoToDownload;
		}

		console.log('download', element);

			console.log('element dans forEach :>> ', element);
			let name = await removeSpecialChars(element.videoTitle);
			let formation = await removeSpecialChars(element.formationTilte);
			let videoNbr = index + 1;

			console.log('index video Nbr :>> ', videoNbr);
			// add O before if inf 10
			if (videoNbr <= 9) {
				videoNbr = '0' + videoNbr;
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
				// url: "https://cdimage.debian.org/debian-cd/current/amd64/iso-dvd/debian-11.4.0-amd64-DVD-1.iso",
				filename: videoFileName,
				conflictAction: 'uniquify',
				saveAs: false,
			});
			badge();
	    // videoData.shift();

	};

	//  surveille les dl creer
	function handleCreated(item) {
		// affiche l'url des telechargememnnt
		/**
		 * donc mettre dans un tableau les telechargemenbt au
		 * fur et a mesure puis les enlever quand ils sont fini
		 */

		console.log(`dl n° ${item.id} creer`);
		console.log('downloading :>> ', downloading);
		downloading++;

		console.log('downloading create :>> ', downloading);
	}

	// surveille les changement de statuts des dl
	function handleChanged(delta) {
		if (delta.state && delta.state.current === 'complete') {
			console.log(`Download has completed. => ${delta.id}`);
			if (downloading > 0) {
				downloading--;
                downloaded++;
				console.log('downloading remove :>> ', downloading);
			}
		}
	}
}; // end linkedinLearningVideoDownloader

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
	// reset Badget
	badge();

	// start script
	chrome.tabs.executeScript({ file: 'script.js' });
}

browser.browserAction.onClicked.addListener(onClick);
