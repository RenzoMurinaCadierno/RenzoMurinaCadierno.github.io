console.log('Super: Lista de compras')

let listaDecompras = []

function setServiceWorker() {

    if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
        .then( function(reg) {
            console.log('Service Worker registrado Exitósamente', reg);
        })
        .catch(function(err) {
            console.log('Error registrando el Service Worker', err);
        });
    }
}

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
        console.log("GET call succeeded!")
    })

    // if we cannot retrieve the resources (no internet connection), then we retrieve it from the local storage 'lista', PARSED IN JSON, since it returns a string and we need an object!

    .fail(err => {
        console.log("AJAX error: ", err)
        listaDecompras = JSON.parse(localStorage.getItem('lista'))
        renderLista()
    })

    // and always execute this part of code (finally)

    .always( () => {
        console.log("End of AJAX call.")
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

    console.log('borrar',index)
    listaDecompras.splice(index,1)
    renderLista()
}

function cambiarPrecio(e,index) {

    console.log('cambiar', index)
    let precioNuevo = Number(e.value)
    console.log(precioNuevo)
    listaDecompras[index].precio = precioNuevo

    console.log(listaDecompras)

}

function configListeners() {

    $('#borrar-lista').click( () => {   

        console.log('click: borrar-lista')
        listaDecompras = []
        renderLista()
    })

    $('#agregar-producto').click( () => {

        console.log('click: agregar-producto')
        let prod = $('#producto').val()
        if (prod != '') {
            listaDecompras.push({ producto: prod, precio: 0 })
            $('#producto').val('')
        }
        renderLista()
    })

}


setServiceWorker()

getDatosLista()

configListeners()


///////////////////
// Local Storage //
///////////////////

// localStorage.setItem('lista', 'lista de compras 01')


///////////////////////////
// uso del querySelector //
///////////////////////////

    // innerHTML toma las tags y las aplica

// document.querySelector('.prueba-jquery').innerHTML = '<i>Testing querySelector</i>'

    // innerText copia todo en bruto

// document.querySelector('.prueba-jquery').innerText = '<i>Testing querySelector</i>'

    // podemos aplicar estilos directamente con .style

// document.querySelector('.prueba-jquery').style.color = 'red'


////////////
// JQUERY //
////////////

    // sintaxis para InnetHTML como antes

// $('.prueba-jquery').html('<i>Testing querySelector</i>')

    // para innerText:

// $('.prueba-jquery').text('<i>Testing querySelector</i>')

    // y para el style:

// $('.prueba-jquery').css('color', 'red')