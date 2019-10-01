// version de la app y nombre del cache

const version = "1.0.0"
const cacheName = `miappuser-${version}`

// un addevent sobre si mismo en install, cuyo
// cb nos avisa que ya esta instalado.
// Ademas, hacemos que el evento espere hasta que
// el cache abra.
// Despues (.then, promise), agregamos al cache un
// array de rutas que van a ser cacheadas.
// Ademas, una promesa luego de eso que haga
// skipWaiting, que fuerza al evento esperando
// a convertirse en service worker.

self.addEventListener("install", e => {

    console.log("SW installed")

    e.waitUntil(

        caches.open(cacheName)
        
        .then(cache => {

            return cache.addAll([

                "/",
                "/index.html",
                "/js/main.js",
            ])

            .then( () => self.skipWaiting() )
        })
    )
})

// una vez cargado, cuando se active, hacemos que
// quede esperando hasta que un cliente accione

self.addEventListener("activate", e => {

    console.log("SW Activated")

    e.waitUntil(self.clients.claim())
})

// y aca, cuando entran los pedidos de la app.
// Podemos hacer lo que querramos aca, nosotros respondemos
// con la apertura y lectura del cache.
// Si el cache es igual a lo buscado por el request,
// lo retornamos (esta en el cache). 
// Si no, busca en el backend si o si, o devuelve null.
// Si hay internet, la PWA siempre pide al backend.

self.addEventListener("fetch", e => {
    
    console.log("SW Fetch")

    e.respondWith(

        caches.open(cacheName)
        
        .then(cache => cache.match(
            e.request, {ignoreSearch: true}))

        .then(response => {
            return response || fetch(e.request)
        })
    )
})