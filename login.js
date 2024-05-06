
const users = [
    {
        name: "Odalis",
        password: "oda"
    },
    {
        name: "Emily",
        password: "emi"
    },
    
]

const userInput = document.getElementById("user")
const password = document.getElementById("password")
const loginBtn = document.getElementById("login")
const logoutBtn = document.getElementById('logout')


loginBtn.addEventListener('click', (event) => {
    event.preventDefault()
    /* Acá se verifica si los inputs ingresados coinciden con los registros de usuario */
    const user = users.find((user) => user.name == userInput.value && user.password == password.value)
    if(user){
        console.log(user);
        localStorage.setItem('isLogged', true) // Se crea una variable en el local storage, y se le asigna 'true' como valor
        localStorage.setItem('userName', userInput.value) // Se crea una variable en el local storage, y se le asigna el usuario como valor
        window.location.href = "./reproductor.html"
    }else alert("Usuario/Contraseña incorrecto(s)")
})
/* En caso de estar ya loggeado, se redirige siempre al usuario al Home */
if(localStorage.getItem('isLogged') === true){
    window.location.href = "./reproductor.html"
}

