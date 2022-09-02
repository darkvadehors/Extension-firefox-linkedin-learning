/** @format */
'use strict';
(async() => {

	console.log('Entre dans tabs.js');

    // retarder l'execution de la fonction

        const result = await new Promise((resolve, reject) => {
            setTimeout(() => {
                // get the url of the video course
                const videoObject = document.querySelectorAll('video.vjs-tech');

                // declare videoData Object
                const videoData = {
                    videoTitle: videoObject[0].ownerDocument.title,
                    videoTastModified: videoObject[0].ownerDocument.lastModified,
                    videoUrl: videoObject[0].currentSrc,
                };

                console.log(videoData);

                // send array to background.js
                resolve(videoData);
            }, 1000);
        }
        );
        return result;

})();
