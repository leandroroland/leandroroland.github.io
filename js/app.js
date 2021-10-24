
//validación de email
const btnEnviar = document.querySelector('#btnEnviar')
const btnBorrar = document.querySelector('#btnBorrar')
const email = document.querySelector('#inputEmail')
const asunto = document.querySelector('#inputAsunto')
const mensaje = document.querySelector('#inputMensaje')
const formulario = document.querySelector('#areaContacto')
const erEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


eventListeners()
function eventListeners(){
    document.addEventListener('DOMContentLoaded', iniciarApp);  

    email.addEventListener ('blur', validarEmail);
    mensaje.addEventListener ('blur', validarEmail);
    asunto.addEventListener ('blur', validarEmail);

    btnEnviar.addEventListener('click', enviarEmail)

    btnBorrar.addEventListener('click', resetForm)
}

function iniciarApp(){
    btnEnviar.disabled = true;
}

function validarEmail(e){
    if(e.target.value.length > 0){

            const cartelError = document.querySelector('p.errorForm');

                if(cartelError){
                    cartelError.remove();
                   }

            
        e.target.classList.remove('errorFormControl');
    }else{
        e.target.classList.add('errorFormControl');
        mostrarErrorForm('Todos los campos son obligatorios');
    }

    

    if(e.target.type === 'email'){
        
        
        if(erEmail.test( e.target.value )){

            const cartelError = document.querySelector('p.errorForm');
            if(cartelError){
                cartelError.remove();
            }

            e.target.classList.remove('errorFormControl');
            
        }else{
            e.target.classList.add('errorFormControl');
            mostrarErrorForm('Email no valido');
        }
    
    }

    if( erEmail.test( email.value ) && asunto.value !== '' && mensaje.value !== '' ){
        btnEnviar.disabled = false;
    }

}

function mostrarErrorForm(mensaje){
    const formularioError = document.querySelector('.groupBtn')
    const mensajeError = document.createElement('p');
    mensajeError.textContent = (mensaje);
    mensajeError.classList.add('mensajeErrorForm', 'errorForm', 'd-flex', 'justify-content-center', 'flex-fill');

    const cartelError = document.querySelectorAll('.errorForm')

    if(cartelError.length === 0 ){
        formularioError.insertBefore(mensajeError, document.querySelector('.btn-light'));
    }

    
}

function enviarEmail(e){
    e.preventDefault();

    const showSpinner = document.querySelector('.spinner');

    showSpinner.style.display = 'block'

    setTimeout(() => {
        showSpinner.style.display = 'none'

        const seEnvio = document.createElement('p');
        seEnvio.classList.add('float-start', 'msgEnviado')
        seEnvio.textContent = 'El mensaje se envio correctamente';

        formulario.insertBefore(seEnvio, showSpinner)

        setTimeout(() => {
            seEnvio.remove();
            resetForm();
        }, 3000);
    }, 2000);
}

function resetForm(){
    formulario.reset();
    email.classList.remove('errorFormControl');
    asunto.classList.remove('errorFormControl');
    mensaje.classList.remove('errorFormControl');
    const cartelError = document.querySelector('p.errorForm');
            if(cartelError){
                cartelError.remove();
            }
    iniciarApp();
}


// Cambio de css del boton menu

const buttonToggle = document.querySelector('#navbarSupportedContent');
const butttonIcon = document.querySelector('#burgerIcon');


eventListenerButtonCss();
function eventListenerButtonCss(){
    buttonToggle.addEventListener('show.bs.collapse', () => {
        butttonIcon.classList.replace('hamburgerLine', 'hamburgerLineFocus');
      });

      buttonToggle.addEventListener('hide.bs.collapse', () => {
        butttonIcon.classList.replace('hamburgerLineFocus', 'hamburgerLine');
      });
    
}

if (matchMedia) {
    const mq = window.matchMedia("(max-width: 991px)");
    mq.addListener(WidthChange);
    WidthChange(mq);
  }
  
  // media query change
  function WidthChange(mq) {
        const boxContactButton = document.querySelector('#boxContactButton');
        const contactButton = document.querySelector('#contactButton');
        const navBar = document.querySelector('#navB');
    if (mq.matches) {
        boxContactButton.classList.remove('d-flex', 'contact-link');
        contactButton.classList.remove('hoverButtonContact', 'hoverButtonContactTwo');
        contactButton.classList.add('contactMob');
        boxContactButton.classList.add('hoverButton');
        navBar.classList.add('nav-color');
    } else {
        boxContactButton.classList.add('d-flex', 'contact-link');
        contactButton.classList.add('hoverButtonContact', 'hoverButtonContactTwo');
        contactButton.classList.remove('contactMob');
        boxContactButton.classList.remove('hoverButton');
        navBar.classList.remove('nav-color');
    }
  
  }