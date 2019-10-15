console.log('-- Market List --')
console.log('A PWA working example.')
console.log(' > Try installing it. Works on any device')
console.log(' > It also supports push notifications. Try Chrome devtools > Application tab > Service Worker, and push a message')

let listaDecompras = []

function getDatosLista() {

    // AJAX simulation using Jquery. 

    // FROM A LOCAL FILE ("lista.json" - EXAMPLE)
    //  > We retrieve what is stored inside lista.json with the .get method

    /*$.get('js/lista.json', function(data) {
        console.log(data)
        listaDecompras = data
        renderLista()
    })*/


    // FROM MOCKAPI.IO (WORKING CONFIG)
    // > Even better, we bring it from a faker.js api (mockapi.io from the internet. 
    //    > After bringing it, save it in listaDecompras variable.
    //    > And set the localstorage up with the name 'lista' and the data being what it retrieved, JSON STRINGIFIED!

    $.get('https://5d9bd3cf686ed000144d2477.mockapi.io/lista', function(data) {

        listaDecompras = data
        localStorage.setItem('lista', JSON.stringify(listaDecompras))
        renderLista()
    })

    // after the get call and before the .always(), execute the code with .done()

    .done( () => {
        // console.log("GET call succeeded!")
    })

    // if we cannot retrieve the resources (no internet connection), then we retrieve it from the local storage 'lista', PARSED IN JSON, since it returns a string and we need an object!

    .fail(err => {
        // console.log("AJAX error: ", err)

        listaDecompras = JSON.parse(localStorage.getItem('lista'))
        renderLista()
    })

    // and always execute this part of code (finally)

    .always( () => {
        // console.log("End of AJAX call.")
    })

}


// Handlebar's replacement for renderLista()

function renderLista() {

    // a var to read listaTemplate's html in index.html

    var source = $('#listaTemplate').html()

    // HBS compile method. We convert the template to handlebars format.

    var template = Handlebars.compile(source)

    // we load the data from listaDeCompras

    var data = { listaDecompras }

    // we inject the result inside the list (template + data inside #lista div's html)

    $('#lista').html(template(data))
}

function borrar(index) {

    // console.log('delete',index)

    listaDecompras.splice(index, 1)
    renderLista()
}

function cambiarPrecio(e,index) {

    // console.log('change', index)

    let precioNuevo = Number(e.value)

    // console.log(precioNuevo)

    listaDecompras[index].precio = precioNuevo

    // console.log(listaDecompras)
}

function configListeners() {

    $('#borrar-lista').click( () => {   

        // console.log('click: borrar-lista')
        
        listaDecompras = []
        renderLista()
    })

    $('#agregar-producto').click( () => {

        //console.log('click: agregar-producto')
        
        let prod = $('#producto').val()

        if (prod != '') {

            listaDecompras.push({ producto: prod, precio: 0 })
            
            $('#producto').val('')

            /* 
            THIS FUNCTIONALITY IS TO POST THE USER ADDED OBJECTS TO CLOUD

            let p = { producto: prod, precio: 0 }
            
            $.post('https://5d9bd3cf686ed000144d2477.mockapi.io/lista', p,function(data) {

                listaDecompras = data
                localStorage.setItem('lista', JSON.stringify(listaDecompras))
                renderLista()
            })
            */
        }
        renderLista()
    })

}


setServiceWorker()

getDatosLista()

configListeners()


function setServiceWorker() {

    // PushManager allows the window object to handle app push events.
    
    if('serviceWorker' in navigator && 'PushManager' in window) {
        console.log("Your device supports Service Worker and Push notifications.")

        navigator.serviceWorker.register('./sw.js')
        .then( function(register) {

            // console.log('Service Worker registered!', register)
            
            // -------------------------------------
            // --- SERVICE WORKER INITIALIZATION ---
            // -------------------------------------
            
            swRegistration = register

            // initialise User Interface for notifications:

            // initialiseUI()
        
            Notification.requestPermission(function(res) {
            if (res === 'granted') {
              navigator.serviceWorker.ready.then(function(reg) {
              })
            }
          })
          
        })

        .catch(function(err) {
            console.log('Service worker registration error!', err)
        })
    
    } else {

        console.warn("Your device does not support Service Worker, or the Service Worker does not support Push Notifications")
    }
}

//----------------------------------------------------------
// SUBSCRIPTION AND UNSUBSCRIPTION MANAGER
// > Uncomment everything to test it
// ---------------------------------------------------------

const applicationServerPublicKey = 'BEWMro_btIuyRdBJbug4xyFtjFNz_8a0C3wGYy2pkIv0VnRH0iscIjfCe_95a3kHnG83Xy6kukKORzGPQpJeUss'

const pushButton = document.querySelector('.js-push-btn')
let isSubscribed = false
let swRegistration = null

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    //console.log(outputArray)
    return outputArray
}

function updateBtn() {

    // switch the button messages and enable it.
    if (isSubscribed) {
        pushButton.textContent = 'Disable push notifications'

    } else {
        pushButton.textContent = 'Enable push notifications'
    }

    pushButton.disabled = false
}

function updateSubscriptionOnServer(subscription) {

    const subscriptionJson = document.querySelector('.js-subscription-json')

    // select the div under the button to show the messages
    const subscriptionDetails =
        document.querySelector('.js-subscription-details')

    // if the user is suscribed, generate ascii key and display the div with the message showing the endpoint and server key. Otherwise, hide it.
    if (subscription) {
        subscriptionJson.textContent = JSON.stringify(subscription)
        subscriptionDetails.classList.remove('is-invisible')

    } else {
        subscriptionDetails.classList.add('is-invisible')
    }
}

function subscribeUser() {

    // generate a user key and suscribe the user to pushManager
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey)
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
        // promise returns a subscription object, that is nothing but the endpoint and the server key (p256dh)
        .then(function (subscription) {

            console.log('User subscribed:', subscription)

            updateSubscriptionOnServer(subscription)
            isSubscribed = true
            updateBtn()
        })
        .catch(function (err) {
            console.log('Failed to subscribe user: ', err)
            updateBtn()
        })
}

function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
        .then(function(subscription) {
            if (subscription) {
                return subscription.unsubscribe()
            }
        })
        .catch(function (err) {
            console.log('Error unsubscribing', err)
        })
        .then(function () {
            updateSubscriptionOnServer(null)
            console.log('User is unsubscribed.')
            isSubscribed = false
            updateBtn()
        })
}

function initialiseUI() {

    // register the listener for the 'allow notifications' button.
    pushButton.addEventListener('click', function () {

        // disable the button to prevent click spam.
        pushButton.disabled = true

        // suscribe user if they are not, unsuscribed if they are.
        if (isSubscribed) {
            unsubscribeUser()
        } else {
            subscribeUser()
        }
    })

    // swRegistration starts up at null, now the value will be modified acording to if the user is suscribed or not. Service worker determines that.
    swRegistration.pushManager.getSubscription()

    .then(function (subscription) {

        isSubscribed = !(subscription === null)

        if (isSubscribed) {
            console.log('User IS subscribed.')

        } else {
            console.log('User is NOT subscribed.')
        }

        updateBtn()
    })
}
