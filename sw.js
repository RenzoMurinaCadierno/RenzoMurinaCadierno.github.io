// CACHE CONFIGS

const CACHE_STATIC_V = "1.0.0";
const CACHE_DYNAMIC_V = "1.0.0";
const CACHE_IMMUTABLE_V = "1.0.0";

const CACHE_STATIC_NAME = `MarketApp-static-${CACHE_STATIC_V}`
const CACHE_DYNAMIC_NAME = `MarketApp-dynamic-${CACHE_DYNAMIC_V}`
const CACHE_IMMUTABLE = `MarketApp-immutable-${CACHE_IMMUTABLE_V}`

// "install" launches when cache is installed successfully.

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

            // Immutable cache resources sometimes fail, 
            // so these ones are added here until the problem 
            // is solved
            'https://fonts.googleapis.com/icon?family=Material+Icons',
            'https://code.jquery.com/jquery-3.4.1.min.js',
            'https://5d9bd3cf686ed000144d2477.mockapi.io/lista',
        ])
    })

    const cacheImmutable = caches.open(CACHE_IMMUTABLE).then(cache => {
        return cache.addAll([
            'https://code.getmdl.io/1.3.0/material.indigo-pink.min.css',
            'https://code.getmdl.io/1.3.0/material.min.js'
        ])
        .then(console.log(cache))
        .catch(err => {
            console.log(err)
        })



        //.then(() => self.skipWaiting())
    })

    // we make the install promise wait until each is ready.
    //  > Remember that each cache is a promise itself, so we
    //    need to use Promise.All to wait for all of them to
    //    finish in order to activate the SW.

    e.waitUntil(
        Promise.all([cacheStatic, cacheImmutable])
            .then(values => { 

                //call skipWaiting and go to cache activation.
                console.log(values) 
                self.skipWaiting()
            }, 
            err => { 
                console.log(err)
            })
    )
})


self.addEventListener('activate',event => {
    console.log('SW Activated!')

    // get the new caches (e.g., if a new version is abailable)

    let cacheWhiteList = [
        CACHE_STATIC_NAME, CACHE_DYNAMIC_NAME, CACHE_IMMUTABLE
    ]

    // after that, return a promise which maps each already
    // stored caches in the browser, and if they do not match 
    // the version (if a new cache is available), then delete
    // the old one.

    caches.keys().then(cacheNames => {
        return Promise.all(
            cacheNames.map(i => {
                if(cacheWhiteList.indexOf(i) === -1) {
                    return caches.delete(i)
                }
            })
        )
    })

    event.waitUntil(self.clients.claim());
})

self.addEventListener('fetch', event => {

    // console.log(event.request)

    const resp = caches.match(event.request)

        // if we get a match with a resource in the cache, 
        // we return it.

        .then(res => {
            
            if (res) {
                console.log(event.request.url, "Resource found!")
                return res
            }
            
            // if we do not find a match, we open/create a
            // dynamic cache, add the request object returned
            // by the fetch promise to it, and return a clone
            // of the newly created response.

            console.log(event.request.url, "Resource not found")
            
            return fetch(event.request).then(newRes => {

                caches.open(CACHE_DYNAMIC_NAME).then(cache => {
                    cache.put(event.request, newRes)
                })

                // two strings are being generated: the one going
                // to the cache, and the other one to the fetch.
                // we need to clone it before return it so that 
                // we do not get a duplicate

                return newRes.clone()
            })
        })
    
    event.respondWith(resp)
})