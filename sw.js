// CACHE CONFIGS

const CACHE_STATIC_V = "1.0.0";
const CACHE_DYNAMIC_V = "1.0.0";
const CACHE_IMMUTABLE_V = "1.0.0";

const CACHE_STATIC_NAME = `MarketApp-static-${CACHE_STATIC_V}`
const CACHE_DYNAMIC_NAME = `MarketApp-dynamic-${CACHE_DYNAMIC_V}`
const CACHE_IMMUTABLE = `MarketApp-immutable-${CACHE_IMMUTABLE_V}`

// "install" launches when cache is installed successfully

self.addEventListener('install' , e => {
    console.log('sw install')

    // when cache opens, it returns a promise with it.
    // We catch that promise and add all files to be cached to it.
    //  > This process is called 'APP SHELL'
    //  > All resources needed to make the app work offline.

    // We do this for each type of cache: Static, Immutable and Dynamic!

    //  > STATIC resources MAY change, and are all personal resources.
    //  > IMMUTABLE resources should NEVER CHANGE!
    //  > DYNAMIC resources change constantly.


    const cacheStatic = caches.open(CACHE_STATIC_NAME).then(cache => {
        return cache.addAll([
            '/',
            '/index.html',
            '/css/estilos.css',
            '/js/main.js',
            '/js/handlebars-v4.3.1.js',
        ])
    })

    const cacheImmutable = caches.open(CACHE_IMMUTABLE).then(cache => {
        return cache.addAll([
            'https://fonts.googleapis.com/icon?family=Material+Icons',
            'https://code.jquery.com/jquery-3.4.1.min.js',
            'https://code.getmdl.io/1.3.0/material.indigo-pink.min.css',
            'https://code.getmdl.io/1.3.0/material.min.js'
        ])
        .then(console.log(cache))
        .catch(err => {
            console.log(err)
        })

        // after all that, call skipWaiting and go to cache activation.

        //.then(() => self.skipWaiting())
    })

    // we make the install promise wait until each is ready.
    //  > Remember that each cache is a promise itself, so we
    //    need to use Promise.All to wait for all of them to
    //    finish in order to activate the SW.

    e.waitUntil(Promise.all([cacheStatic, cacheImmutable])
        .then(values => { 
            console.log(values) 
        }, 
        err => { 
            console.log(err)
        })
    )

    // e.waitUntil(
    //     caches.open(cacheName).then(cache => {
    //         return cache.addAll([
    //             '/',
    //             '/index.html',
    //             '/css/estilos.css',
    //             '/js/main.js'
    //         ])
    //         .then(() => self.skipWaiting())
    //     })
    // )
})


self.addEventListener('activate',event => {
    console.log('sw activate')
    event.waitUntil(self.clients.claim());
})

self.addEventListener('fetch', event => {

    let req = event.request
    event.respondWith(fetch(req))

    // console.log('sw fetch');
    // event.respondWith(
    //     caches.open(cacheName)
    //     .then(cache => cache.match(event.request, {ignoreSearch: true}))
    //     .then( response => {
    //         return response || fetch(event.request);
    //     })
    // );
});


